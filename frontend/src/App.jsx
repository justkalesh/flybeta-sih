import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CompetencyProvider } from './context/CompetencyContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import TrackSelectionPage from './pages/TrackSelectionPage';
import TrackRoadmapPage from './pages/TrackRoadmapPage';
import LessonRunnerPage from './pages/LessonRunnerPage';
import ProjectArchitectPage from './pages/ProjectArchitectPage';
import DocQuizPage from './pages/DocQuizPage';
import VisionPage from './pages/VisionPage';
import VideoDetailPage from './pages/VideoDetailPage';
import ResetPasswordConfirmPage from './pages/ResetPasswordConfirmPage';
import DashboardPage from './pages/DashboardPage';
import DiagnosticPage from './pages/DiagnosticPage';
import RecommendationsPage from './pages/RecommendationsPage';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CompetencyProvider>
            <Routes>
              {/* Landing page — standalone, no app shell */}
              <Route path="/" element={<LandingPage />} />

              {/* Password reset confirmation — standalone */}
              <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirmPage />} />

              {/* Onboarding diagnostic — standalone, no navbar (first-time only) */}
              <Route path="/onboarding" element={<DiagnosticPage />} />

              {/* App routes — inside Layout with Navbar */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tracks" element={<TrackSelectionPage />} />
                <Route path="/track/:name" element={<TrackRoadmapPage />} />
                <Route path="/track/:name/level/:num/lesson/:order" element={<LessonRunnerPage />} />
                <Route path="/diagnostic" element={<DiagnosticPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
                <Route path="/labs" element={<Navigate to="/labs/quiz-generator" replace />} />
                <Route path="/labs/architect" element={<ProjectArchitectPage />} />
                <Route path="/labs/quiz-generator" element={<DocQuizPage />} />
                <Route path="/vision" element={<VisionPage />} />
                <Route path="/vision/video/:id" element={<VideoDetailPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>
            </Routes>
          </CompetencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
