import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileIntake from '../components/diagnostic/ProfileIntake';
import AIDiagnosticAssessment from '../components/diagnostic/AIDiagnosticAssessment';
import DiagnosticResults from '../components/diagnostic/DiagnosticResults';
import AttemptHistory from '../components/diagnostic/AttemptHistory';
import AuthModal from '../components/auth/AuthModal';
import ThemeSelector from '../components/onboarding/ThemeSelector';
import { useCompetency } from '../context/CompetencyContext';
import { generateDiagnosticQuiz, submitDiagnosticQuiz, fetchDiagnosticHistory } from '../services/api';
import { BarChart3, History, Loader2, AlertTriangle } from 'lucide-react';

const FRAC_LABELS = {
  comp_statistical: { label: 'Statistical', color: '#3B82F6' },
  comp_technical: { label: 'Technical', color: '#8B5CF6' },
  comp_digital_governance: { label: 'Digital Gov', color: '#10B981' },
  comp_behavioural: { label: 'Behavioural', color: '#F59E0B' },
};

/**
 * DiagnosticPage — AI-Powered Personalized Skill Gap Assessment
 * 
 * Flow: ProfileIntake → AI Quiz Generation → Take Quiz (no feedback) → Submit → Results Overview
 * Also shows history of past attempts.
 */
export default function DiagnosticPage() {
  const { user, loading: authLoading } = useAuth();
  const { saveProfile, profile: existingProfile, hasCompletedDiagnostic } = useCompetency();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  // View state: 'theme-select' | 'intake' | 'generating' | 'quiz' | 'submitting' | 'results' | 'history'
  const [view, setView] = useState(isOnboarding ? 'theme-select' : 'intake');
  const [intakeData, setIntakeData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Load history on mount if logged in
  useEffect(() => {
    if (user) {
      fetchDiagnosticHistory()
        .then(setHistory)
        .catch(() => {});
    }
  }, [user]);

  // Save competency profile when results arrive
  useEffect(() => {
    if (results && view === 'results') {
      // Update competency profile with latest scores
      const scores = {};
      const sectionScores = results.section_scores || {};
      for (const [quadrant, data] of Object.entries(sectionScores)) {
        scores[quadrant] = Math.round((data.total / 8) * 100);
      }
      const fullProfile = { ...intakeData, ...scores };
      saveProfile(fullProfile);

      // Tour logic — only for first-time users
      const hasEverSeenTour = localStorage.getItem('mospi_has_seen_tour');
      if (hasEverSeenTour !== 'true') {
        localStorage.setItem('mospi_has_seen_tour', '');
      }
    }
  }, [results, view]);

  const handleIntakeComplete = async (data) => {
    setIntakeData(data);
    setView('generating');
    setError(null);

    try {
      const response = await generateDiagnosticQuiz({
        designation: data.designation,
        division: data.division,
        years_of_service: data.yearsOfService,
        previous_trainings: data.previousTrainings,
      });
      setQuizData({ sections: response.sections });
      setView('quiz');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate quiz.';
      setError(msg);
      setView('intake');
    }
  };

  const handleQuizSubmit = async (userAnswers) => {
    setAnswers(userAnswers);
    setView('submitting');
    setError(null);

    try {
      const result = await submitDiagnosticQuiz(
        { sections: quizData.sections },
        userAnswers,
      );
      setResults(result);
      setView('results');

      // Refresh history
      if (user) {
        fetchDiagnosticHistory().then(setHistory).catch(() => {});
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to submit assessment.';
      setError(msg);
      setView('quiz'); // Let them retry
    }
  };

  const handleRetake = () => {
    setView('intake');
    setQuizData(null);
    setAnswers({});
    setResults(null);
    setError(null);
  };

  const handleSkip = (data) => {
    // Save profile info without quiz scores
    const profileData = {
      ...data,
      comp_statistical: 0,
      comp_technical: 0,
      comp_digital_governance: 0,
      comp_behavioural: 0,
    };
    saveProfile(profileData);

    // Setup tour for first-time users
    const hasEverSeenTour = localStorage.getItem('mospi_has_seen_tour');
    if (hasEverSeenTour !== 'true') {
      localStorage.setItem('mospi_has_seen_tour', '');
    }

    // Navigate: if logged in go to dashboard, otherwise show signup
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuth(true);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="tour-page-diagnostic">
      {/* Page Header (hidden during theme selection) */}
      {view !== 'theme-select' && (
      <header className="mb-10">
        <div
          className="bg-surface p-5 md:p-8 inline-block"
          style={{
            border: 'var(--border-width) solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-brutal-lg)',
          }}
        >
          <div className="flex items-center gap-2 md:gap-4 mb-2 flex-wrap">
            <div
              className="brutalist-badge"
              style={{ background: 'var(--color-primary)', color: 'var(--color-canvas)' }}
            >
              AI ASSESSMENT
            </div>
            <span className="label-mono text-muted">
              FRAC Competency Diagnostic
            </span>
            {!user && !isOnboarding && (
              <span
                className="brutalist-badge"
                style={{ background: '#059669', color: '#fff' }}
              >
                NO SIGNUP REQUIRED
              </span>
            )}
          </div>
          <h1 className="heading-xl m-0" style={{ color: 'var(--color-primary)' }}>
            Skill Gap Analysis
          </h1>
          <p className="text-muted mt-2 mb-0" style={{ maxWidth: '600px' }}>
            {view === 'generating' && 'Generating your personalized assessment using AI...'}
            {view === 'submitting' && 'Evaluating your responses with AI...'}
            {view === 'quiz' && 'Answer all questions. Results will be shown after submission.'}
            {view === 'results' && 'Assessment complete. Review your results below.'}
            {view === 'history' && 'View your past assessment attempts and track progress.'}
            {view === 'intake' && (hasCompletedDiagnostic && user
              ? 'Retake the AI-generated assessment to update your competency profile.'
              : "AI generates a unique quiz based on your officer profile. 16 questions across 4 FRAC sections."
            )}
          </p>
        </div>

        {/* Tab Buttons */}
        {user && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => view !== 'generating' && view !== 'submitting' && handleRetake()}
              className="brutalist-btn px-5 py-2 flex items-center gap-2"
              style={{
                background: view !== 'history' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: view !== 'history' ? '#fff' : 'var(--color-ink)',
              }}
            >
              <BarChart3 size={16} /> Take Assessment
            </button>
            <button
              onClick={() => setView('history')}
              className="brutalist-btn px-5 py-2 flex items-center gap-2"
              style={{
                background: view === 'history' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: view === 'history' ? '#fff' : 'var(--color-ink)',
              }}
            >
              <History size={16} /> Attempt History ({history.length})
            </button>
          </div>
        )}
      </header>
      )}

      {/* Error Banner */}
      {error && (
        <div
          className="brutalist-card p-4 mb-6 flex items-center gap-3"
          style={{ background: '#FEF2F2', border: '2px solid #DC2626' }}
        >
          <AlertTriangle size={20} style={{ color: '#DC2626' }} />
          <span style={{ color: '#DC2626' }}>{error}</span>
        </div>
      )}

      {/* ── GENERATING STATE ── */}
      {view === 'generating' && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="brutalist-card p-10 text-center bg-surface" style={{ maxWidth: 500 }}>
            <Loader2 size={48} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
            <h3 className="heading-md mb-2">Generating Your Assessment</h3>
            <p className="text-muted text-sm">
              AI is creating 16 personalized questions based on your profile as a{' '}
              <strong>{intakeData?.designation}</strong> in{' '}
              <strong>{intakeData?.division}</strong>...
            </p>
            <div className="mt-4 flex gap-2 flex-wrap justify-center">
              {Object.values(FRAC_LABELS).map((q) => (
                <span
                  key={q.label}
                  className="label-mono px-2 py-1 text-xs"
                  style={{ background: q.color, color: '#fff' }}
                >
                  {q.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI QUIZ (stays mounted during submission so answers aren't lost) ── */}
      {(view === 'quiz' || view === 'submitting') && quizData && (
        <div style={{ position: 'relative' }}>
          {view === 'submitting' && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div className="brutalist-card p-10 text-center bg-surface" style={{ maxWidth: 500 }}>
                <Loader2 size={48} className="mx-auto mb-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
                <h3 className="heading-md mb-2">Evaluating Responses</h3>
                <p className="text-muted text-sm">
                  AI is grading your MCQs and evaluating descriptive answers...
                </p>
              </div>
            </div>
          )}
          <AIDiagnosticAssessment
            sections={quizData.sections}
            onSubmit={handleQuizSubmit}
          />
        </div>
      )}

      {/* ── PROFILE INTAKE ── */}
      {view === 'intake' && (
        <ProfileIntake fresh onComplete={handleIntakeComplete} onSkip={isOnboarding ? handleSkip : undefined} />
      )}

      {/* ── RESULTS ── */}
      {view === 'results' && results && (
        <DiagnosticResults
          results={results}
          quizData={quizData}
          answers={answers}
          onRetake={handleRetake}
          showSignup={!user}
          onSignup={() => setShowAuth(true)}
        />
      )}

      {/* ── HISTORY ── */}
      {view === 'history' && (
        <AttemptHistory attempts={history} onRetake={handleRetake} />
      )}

      {/* ── THEME SELECTOR (first step of onboarding) ── */}
      {view === 'theme-select' && (
        <ThemeSelector
          onComplete={() => setView('intake')}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(type) => {
          if (type === 'register') {
            // Reset tour so it starts fresh on dashboard
            localStorage.removeItem('mospi_has_seen_tour');
            localStorage.setItem('mospi_tour_page', '0');
            // Show theme selector before navigating to dashboard
            setShowAuth(false);
            navigate('/dashboard');
          }
        }}
        initialView="register"
        customMessage="🎯 Great job on the assessment! Create an account to save your FRAC competency profile and unlock personalized training recommendations."
      />
    </div>
  );
}
