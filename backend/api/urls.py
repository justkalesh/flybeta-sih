from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import (
    DomainViewSet, LevelViewSet, LessonViewSet,
    UserMeView, UserProfileView,
    BlueprintView, CodeReviewView, SynapseExtractView, OracleChatView,
    CapstoneSubmissionViewSet, DocumentQuizView,
    DiagnosticQuizGenerateView, DiagnosticSubmitView, DiagnosticHistoryView,
)

router = DefaultRouter()
router.register(r'domains', DomainViewSet)
router.register(r'levels', LevelViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'capstone', CapstoneSubmissionViewSet, basename='capstone')

app_name = 'api'

urlpatterns = [
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/diagnostic-submit/', DiagnosticSubmitView.as_view(), name='diagnostic-submit'),
    path('users/diagnostic-history/', DiagnosticHistoryView.as_view(), name='diagnostic-history'),
    path('ai/architect/', BlueprintView.as_view(), name='ai-architect'),
    path('ai/reviewer/', CodeReviewView.as_view(), name='ai-reviewer'),
    path('ai/synapse/', SynapseExtractView.as_view(), name='ai-synapse'),
    path('ai/oracle/', OracleChatView.as_view(), name='oracle_chat'),
    path('ai/doc-quiz/', DocumentQuizView.as_view(), name='ai-doc-quiz'),
    path('ai/diagnostic-quiz/', DiagnosticQuizGenerateView.as_view(), name='ai-diagnostic-quiz'),
    path('', include(router.urls)),
]
