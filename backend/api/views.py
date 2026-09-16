from datetime import date, timedelta
import re
import traceback

from accounts.models import StudentProfile, DiagnosticAttempt
# pyrefly: ignore [missing-import]
from django.contrib.auth import get_user_model
# pyrefly: ignore [missing-import]
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status

from learn.models import Domain, Level, Lesson, LevelProgress, DomainProgress, CapstoneSubmission
from accounts.models import StudentProfile
from api.serializers import (
    DomainSerializer, LevelSerializer, LessonSerializer, UserStatsSerializer,
    CapstoneSubmissionSerializer, UserProfileSerializer
)
from api.ai_services import generate_project_blueprint, generate_code_review, generate_video_quiz, ask_oracle, extract_text_from_file, generate_quiz_from_document, generate_diagnostic_quiz, evaluate_descriptive_answers
from learn.services.github_service import fetch_github_repo_content
from learn.services.ai_evaluator import evaluate_code
from rest_framework import viewsets


def get_dev_user():
    """Get the dev user for mock auth. In production, use request.user instead."""
    User = get_user_model()
    return User.objects.get(username='dev')


class UserMeView(APIView):
    """
    GET /api/v1/users/me/
    Returns the current user's gamification stats.
    """
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserStatsSerializer(request.user.profile)
        return Response(serializer.data)


class UserProfileView(APIView):
    """
    GET  /api/v1/users/profile/  — full dashboard payload (rank, XP, theme, progress)
    PATCH /api/v1/users/profile/ — update name, bio, avatar, theme_preference
    """
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        profile = request.user.profile
        # Auto-sync rank from XP on every read
        computed = profile.compute_rank()
        if profile.current_rank != computed:
            profile.current_rank = computed
            profile.save(update_fields=['current_rank'])
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = request.user.profile
        user = request.user
        updated_fields = []
        updated_user_fields = []

        # ── Name (on CustomUser) ─────────────────────────────────────
        name = request.data.get('name')
        if name is not None:
            user.name = name.strip()
            updated_user_fields.append('name')

        # ── Bio (on StudentProfile) ──────────────────────────────────
        bio = request.data.get('bio')
        if bio is not None:
            if len(bio) > 160:
                return Response(
                    {'error': 'Bio must be 160 characters or fewer.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.bio = bio.strip()
            updated_fields.append('bio')

        # ── Avatar (file upload) ─────────────────────────────────────
        avatar = request.FILES.get('avatar')
        if avatar is not None:
            profile.avatar = avatar
            updated_fields.append('avatar')

        # ── Theme preference ─────────────────────────────────────────
        theme = request.data.get('theme_preference')
        if theme is not None:
            if theme not in StudentProfile.VALID_THEMES:
                return Response(
                    {'error': f'Invalid theme. Choose from: {sorted(StudentProfile.VALID_THEMES)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.theme_preference = theme
            updated_fields.append('theme_preference')

        # ── Persist ──────────────────────────────────────────────────
        if updated_user_fields:
            user.save(update_fields=updated_user_fields)
        if updated_fields:
            profile.save(update_fields=updated_fields)

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)


class DomainViewSet(ReadOnlyModelViewSet):
    """
    Read-only API for learning domains (tracks).
    Lists all domains with nested levels and lessons.
    """
    queryset = Domain.objects.filter(is_published=True).prefetch_related('levels__lessons').all()
    serializer_class = DomainSerializer
    lookup_field = 'name'  # Allow lookup by slug: /api/v1/domains/cloud/


class LevelViewSet(ReadOnlyModelViewSet):
    """
    Read-only API for levels.
    Supports filtering by domain: /api/v1/levels/?domain=cloud
    """
    queryset = Level.objects.select_related('domain').prefetch_related('lessons').all()
    serializer_class = LevelSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        domain_name = self.request.query_params.get('domain')
        if domain_name:
            qs = qs.filter(domain__name=domain_name)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pass_quiz(self, request, pk=None):
        level = self.get_object()
        user = request.user
        
        with transaction.atomic():
            domain_progress, _ = DomainProgress.objects.get_or_create(
                user=user,
                domain=level.domain
            )
            
            if domain_progress.highest_unlocked_level == level.number:
                domain_progress.highest_unlocked_level += 1
                domain_progress.save()
                
                profile = user.profile
                profile.xp += 50
                profile.total_xp += 50
                profile.current_rank = profile.compute_rank()
                profile.save()

        # Re-fetch profile to ensure serializer sees updated domain_progress
        profile = StudentProfile.objects.select_related('user').get(user=user)
                
        return Response({
            'status': 'success',
            'user': UserProfileSerializer(profile).data
        }, status=status.HTTP_200_OK)


class LessonViewSet(ReadOnlyModelViewSet):
    """
    Read-only API for individual lessons.
    Supports filtering by level: /api/v1/lessons/?level=<id>
    Also provides POST /api/v1/lessons/{id}/complete/ to mark lesson done.
    """
    queryset = Lesson.objects.select_related('level__domain').all()
    serializer_class = LessonSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        level_id = self.request.query_params.get('level')
        if level_id:
            qs = qs.filter(level_id=level_id)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """
        POST /api/v1/lessons/{id}/complete/

        Marks a lesson as completed for the current user:
        1. Get-or-create LevelProgress for this user + lesson's level
        2. Add lesson to lessons_completed (idempotent)
        3. Award XP and coins to UserProfile
        4. Update streak based on last_active_date
        5. Check if all mandatory lessons are done → mark level complete
        6. Return updated user stats
        """
        lesson = self.get_object()
        user = request.user
        profile = user.profile
        today = date.today()

        with transaction.atomic():
            # 1. Get or create LevelProgress
            level_progress, _ = LevelProgress.objects.get_or_create(
                user=user,
                level=lesson.level,
            )

            # 2. Check if already completed (idempotent)
            already_completed = level_progress.lessons_completed.filter(pk=lesson.pk).exists()

            if not already_completed:
                # Add lesson to completed set
                level_progress.lessons_completed.add(lesson)

                # 3. Award XP and coins
                profile.xp += lesson.xp_reward
                profile.total_xp += lesson.xp_reward
                profile.coins += lesson.coins_reward

                # 4. Streak logic
                if profile.last_active_date is None:
                    # First ever activity
                    profile.streak = 1
                elif profile.last_active_date == today:
                    # Already active today — no streak change
                    pass
                elif profile.last_active_date == today - timedelta(days=1):
                    # Active yesterday — increment streak
                    profile.streak += 1
                else:
                    # Streak broken — reset to 1
                    profile.streak = 1

                profile.last_active_date = today
                profile.current_rank = profile.compute_rank()
                profile.save()

            # 5. Check level completion (all mandatory lessons done?)
            mandatory_lessons = set(
                lesson.level.lessons.filter(is_mandatory=True).values_list('pk', flat=True)
            )
            completed_lessons = set(
                level_progress.lessons_completed.values_list('pk', flat=True)
            )
            level_completed = mandatory_lessons.issubset(completed_lessons)

            if level_completed:
                if not level_progress.is_completed:
                    level_progress.is_completed = True
                    level_progress.save()

                # Auto-unlock next level
                domain_progress, _ = DomainProgress.objects.get_or_create(
                    user=user,
                    domain=lesson.level.domain
                )
                if domain_progress.highest_unlocked_level == lesson.level.number:
                    domain_progress.highest_unlocked_level += 1
                    domain_progress.save()

        # Re-fetch profile so serializer sees updated domain_progress
        profile = StudentProfile.objects.select_related('user').get(user=user)

        # 6. Return updated stats (full profile payload)
        return Response({
            'status': 'already_completed' if already_completed else 'completed',
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
                'xp_reward': lesson.xp_reward,
                'coins_reward': lesson.coins_reward,
            },
            'user': UserProfileSerializer(profile).data,
            'level_completed': level_completed,
        }, status=status.HTTP_200_OK)


class BlueprintView(APIView):
    """
    POST /api/v1/ai/architect/

    Accepts a project prompt and returns a step-by-step blueprint.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()

        if not prompt:
            return Response(
                {'error': 'A "prompt" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            steps = generate_project_blueprint(prompt)
            return Response({
                'prompt': prompt,
                'steps': steps,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': 'The Architect is meditating. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CodeReviewView(APIView):
    """
    POST /api/v1/ai/reviewer/

    Accepts a code snippet and returns structured review findings.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip()

        if not code:
            return Response(
                {'error': 'A "code" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        language = request.data.get('language', 'python').strip()
        try:
            findings = generate_code_review(code, language)
            return Response({
                'code': code,
                'language': language,
                'findings': findings,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': 'The Reviewer is meditating. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SynapseExtractView(APIView):
    """
    POST /api/v1/ai/synapse/
    Accepts video_url, extracts video_id, calls Gemini for quiz generation.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        video_url = request.data.get('video_url', '').strip()
        
        if not video_url:
            return Response(
                {'error': 'A "video_url" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        # Extract ID using regex
        video_id = None
        patterns = [
            r'(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})',
            r'(?:youtu\.be\/)([a-zA-Z0-9_-]{11})',
            r'(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
            r'^([a-zA-Z0-9_-]{11})$' # allow raw ID
        ]
        
        for pattern in patterns:
            match = re.search(pattern, video_url)
            if match:
                video_id = match.group(1)
                break
                
        if not video_id:
            return Response(
                {'error': 'Invalid YouTube URL or ID.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        try:
            quiz = generate_video_quiz(video_id)
            return Response(quiz, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OracleChatView(APIView):
    """
    POST /api/v1/ai/oracle/
    Accepts message and history, calls ask_oracle, returns reply.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])
        user_context = request.data.get('user_context', None)

        if not message:
            return Response(
                {'error': 'A "message" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reply = ask_oracle(message, history, user_context)
            return Response({'reply': reply}, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': 'The Oracle is meditating. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CapstoneSubmissionViewSet(viewsets.ModelViewSet):
    """
    POST /api/v1/capstone/
    Accepts a GitHub URL, extracts code, grades it, and returns the AI report card.
    """
    queryset = CapstoneSubmission.objects.all()
    serializer_class = CapstoneSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        domain_id = request.data.get('domain')
        github_url = request.data.get('github_url')
        
        if not domain_id or not github_url:
            return Response({'error': 'domain and github_url are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            domain = Domain.objects.get(pk=domain_id)
        except Domain.DoesNotExist:
            return Response({'error': 'Domain not found'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Save as pending
        submission = CapstoneSubmission.objects.create(
            user=user,
            domain=domain,
            github_url=github_url,
            status='pending'
        )

        try:
            # 2. Fetch code from GitHub
            code_content = fetch_github_repo_content(github_url)
            
            # 3. Grade using AI
            eval_result = evaluate_code(domain.title, code_content)
            
            # 4. Update the submission
            submission.score = eval_result['score']
            submission.passed = eval_result['passed']
            submission.ai_feedback = eval_result['feedback']
            submission.status = 'graded'
            submission.save()
            
        except Exception as e:
            submission.status = 'failed'
            submission.ai_feedback = f"Error during evaluation: {str(e)}"
            submission.save()

        # 5. Return updated submission
        serializer = self.get_serializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DocumentQuizView(APIView):
    """
    POST /api/v1/ai/doc-quiz/
    Upload a PDF/PPTX → extract text → generate FRAC-tagged MCQs via Gemini.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    def post(self, request):
        document = request.FILES.get('document')
        if not document:
            return Response(
                {'error': 'A "document" file (PDF or PPTX) is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file size
        if document.size > self.MAX_FILE_SIZE:
            return Response(
                {'error': f'File too large. Maximum size is 5MB (got {document.size // 1024}KB).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file type
        filename = document.name.lower()
        if not (filename.endswith('.pdf') or filename.endswith('.pptx')):
            return Response(
                {'error': 'Only PDF (.pdf) and PowerPoint (.pptx) files are supported.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        num_questions = int(request.data.get('num_questions', 5))
        difficulty = request.data.get('difficulty', 'intermediate').strip()

        try:
            # 1. Extract text from the uploaded file
            text = extract_text_from_file(document, document.name)

            if not text or len(text.strip()) < 100:
                return Response(
                    {'error': 'Could not extract enough text from the document. Please upload a text-based PDF or PPTX.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 2. Generate quiz from the extracted text
            questions = generate_quiz_from_document(text, num_questions, difficulty)

            return Response({
                'filename': document.name,
                'text_length': len(text),
                'num_questions': len(questions),
                'difficulty': difficulty,
                'questions': questions,
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': 'An unexpected error occurred during quiz generation.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DiagnosticQuizGenerateView(APIView):
    """
    POST /api/v1/ai/diagnostic-quiz/
    Generate a personalized FRAC skill-gap assessment quiz.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        designation = request.data.get('designation', '')
        division = request.data.get('division', '')
        years_of_service = request.data.get('years_of_service', '')
        previous_trainings = request.data.get('previous_trainings', [])

        if not designation:
            return Response(
                {'error': 'Designation is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sections = generate_diagnostic_quiz(
                designation, division, years_of_service, previous_trainings
            )
            return Response({'sections': sections}, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': 'Failed to generate diagnostic quiz.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DiagnosticSubmitView(APIView):
    """
    POST /api/v1/users/diagnostic-submit/
    Submit answers, auto-grade MCQs, AI-grade descriptives, persist attempt.
    Accepts both authenticated and guest users.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        quiz_payload = request.data.get('quiz_payload', {})
        answers_payload = request.data.get('answers_payload', {})
        sections = quiz_payload.get('sections', [])

        if not sections or len(sections) != 4:
            return Response(
                {'error': 'Invalid quiz payload. Expected 4 sections.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        QUADRANT_FIELD_MAP = {
            'comp_statistical': 'score_statistical',
            'comp_technical': 'score_technical',
            'comp_digital_governance': 'score_digital_governance',
            'comp_behavioural': 'score_behavioural',
        }

        try:
            # 1. Auto-grade MCQs
            section_scores = {}
            for section in sections:
                quadrant = section['frac_quadrant']
                mcq_answers = answers_payload.get(quadrant, {}).get('mcq_answers', [])
                mcq_score = 0
                for i, mcq in enumerate(section.get('mcqs', [])):
                    if i < len(mcq_answers) and mcq_answers[i] == mcq.get('correct_answer'):
                        mcq_score += 1
                section_scores[quadrant] = {'mcq_score': mcq_score}

            # 2. AI-grade descriptives
            descriptive_inputs = []
            for section in sections:
                quadrant = section['frac_quadrant']
                desc = section.get('descriptive', {})
                # Handle AI sometimes returning descriptive as a list instead of dict
                if isinstance(desc, list):
                    desc = desc[0] if desc else {}
                user_answer = answers_payload.get(quadrant, {}).get('descriptive_answer', '')
                descriptive_inputs.append({
                    'frac_quadrant': quadrant,
                    'question_text': desc.get('question_text', '') if isinstance(desc, dict) else '',
                    'ideal_answer_points': desc.get('ideal_answer_points', []) if isinstance(desc, dict) else [],
                    'user_answer': user_answer,
                })

            evaluations = evaluate_descriptive_answers(descriptive_inputs)

            # 3. Combine scores
            ai_feedback = {}
            total_score = 0
            for eval_item in evaluations:
                quadrant = eval_item.get('frac_quadrant', '')
                desc_score = float(eval_item.get('score', 0))
                if quadrant in section_scores:
                    section_scores[quadrant]['desc_score'] = desc_score
                    section_scores[quadrant]['total'] = section_scores[quadrant]['mcq_score'] + desc_score
                    total_score += section_scores[quadrant]['total']
                ai_feedback[quadrant] = {
                    'score': desc_score,
                    'feedback': eval_item.get('feedback', ''),
                }

            # 4. Persist attempt (user=None for guests)
            current_user = request.user if request.user.is_authenticated else None
            attempt = DiagnosticAttempt.objects.create(
                user=current_user,
                score_statistical=section_scores.get('comp_statistical', {}).get('total', 0),
                score_technical=section_scores.get('comp_technical', {}).get('total', 0),
                score_digital_governance=section_scores.get('comp_digital_governance', {}).get('total', 0),
                score_behavioural=section_scores.get('comp_behavioural', {}).get('total', 0),
                total_score=total_score,
                quiz_payload=quiz_payload,
                answers_payload=answers_payload,
                ai_feedback=ai_feedback,
            )

            return Response({
                'attempt_id': attempt.id,
                'total_score': total_score,
                'max_score': 32,
                'section_scores': section_scores,
                'ai_feedback': ai_feedback,
                'attempted_at': attempt.attempted_at.isoformat(),
            }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            traceback.print_exc()
            return Response(
                {'error': 'Failed to submit diagnostic assessment.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DiagnosticHistoryView(APIView):
    """
    GET /api/v1/users/diagnostic-history/
    Return all past diagnostic attempts for the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = DiagnosticAttempt.objects.filter(user=request.user)
        data = [
            {
                'id': a.id,
                'attempted_at': a.attempted_at.isoformat(),
                'score_statistical': a.score_statistical,
                'score_technical': a.score_technical,
                'score_digital_governance': a.score_digital_governance,
                'score_behavioural': a.score_behavioural,
                'total_score': a.total_score,
                'max_score': 32,
            }
            for a in attempts
        ]
        return Response({'attempts': data}, status=status.HTTP_200_OK)
