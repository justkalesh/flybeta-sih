import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DiagnosticAssessment from '../components/diagnostic/DiagnosticAssessment';
import ProfileIntake from '../components/diagnostic/ProfileIntake';
import AuthModal from '../components/auth/AuthModal';
import { useCompetency } from '../context/CompetencyContext';
import { ALL_TAGS, COMPETENCY_META, TARGET_FRAMEWORK } from '../data/competencyTaxonomy';
import { BarChart3, UserPlus, RotateCcw, CheckCircle } from 'lucide-react';

/**
 * DiagnosticPage
 * 
 * Now accessible WITHOUT login (pre-auth onboarding).
 * Flow: ProfileIntake → DiagnosticAssessment → Results → Signup Prompt → Dashboard
 */
export default function DiagnosticPage() {
  const { user, loading } = useAuth();
  const { saveProfile, profile: existingProfile, hasCompletedDiagnostic } = useCompetency();
  const navigate = useNavigate();

  const [intakeData, setIntakeData] = useState(null);
  const [competencyScores, setCompetencyScores] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // If user logs in while on the results page, auto-save and redirect
  useEffect(() => {
    if (user && competencyScores && showResults) {
      const fullProfile = { ...intakeData, ...competencyScores };
      saveProfile(fullProfile);
      // Only trigger tour for first-time users (never seen it before)
      const hasEverSeenTour = localStorage.getItem('mospi_has_seen_tour');
      if (hasEverSeenTour !== 'true') {
        localStorage.setItem('mospi_has_seen_tour', ''); // Clear so tour shows for new users
      }
      navigate('/dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="brutalist-card p-8 text-center">
          <p className="heading-md">Loading...</p>
        </div>
      </div>
    );
  }

  const handleIntakeComplete = (data) => {
    setIntakeData(data);
  };

  const handleDiagnosticComplete = (scores) => {
    setCompetencyScores(scores);

    if (user) {
      // Already logged in — save and redirect
      const fullProfile = { ...intakeData, ...scores };
      saveProfile(fullProfile);
      navigate('/dashboard');
    } else {
      // Not logged in — show results + signup prompt
      setShowResults(true);
    }
  };

  const handleRetake = () => {
    setIntakeData(null);
    setCompetencyScores(null);
    setShowResults(false);
  };

  // ── Results View (pre-auth) ─────────────────────────────────────────
  if (showResults && competencyScores) {
    const designation = intakeData?.designation || 'JSO';

    return (
      <div>
        <header className="mb-8">
          <div
            className="bg-surface p-6 md:p-8 inline-block"
            style={{
              border: 'var(--border-width) solid var(--color-border)',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-brutal-lg)',
            }}
          >
            <div className="flex items-center gap-2 md:gap-4 mb-2 flex-wrap">
              <div
                className="brutalist-badge"
                style={{ background: 'var(--color-emerald)', color: '#fff' }}
              >
                COMPLETE
              </div>
              <span className="label-mono text-muted">
                FRAC Competency Results
              </span>
            </div>
            <h1 className="heading-xl m-0" style={{ color: 'var(--color-primary)' }}>
              Your Skill Gap Profile
            </h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score Cards */}
          <div className="brutalist-card p-6 bg-surface">
            <h3 className="heading-md mb-4 flex items-center gap-2">
              <BarChart3 size={20} style={{ color: 'var(--color-primary)' }} />
              Competency Breakdown
            </h3>
            <div className="space-y-4">
              {ALL_TAGS.map((tag) => {
                const meta = COMPETENCY_META[tag];
                const score = competencyScores?.[tag] ?? 0;
                const target = TARGET_FRAMEWORK[designation]?.[tag] ?? 60;
                const isGap = score < target;
                return (
                  <div key={tag}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="label-mono font-bold text-sm">
                        {meta.icon} {meta.label}
                      </span>
                      <span
                        className="label-mono text-sm"
                        style={{ color: isGap ? '#DC2626' : 'var(--color-emerald)' }}
                      >
                        {score}%{' '}
                        <span className="text-muted text-xs">/ {target}% target</span>
                      </span>
                    </div>
                    <div
                      className="w-full h-3 bg-canvas overflow-hidden"
                      style={{
                        border: 'var(--border-width) solid var(--color-border)',
                        borderRadius: 'var(--border-radius)',
                      }}
                    >
                      <div
                        className="h-full transition-all duration-700 ease-out"
                        style={{
                          width: `${score}%`,
                          backgroundColor: isGap ? '#DC2626' : meta.color,
                          borderRadius: 'var(--border-radius)',
                        }}
                      />
                    </div>
                    {isGap && (
                      <p className="text-xs text-muted mt-1" style={{ color: '#DC2626' }}>
                        ⚠ Below target — training recommended
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signup Prompt */}
          <div
            className="brutalist-card p-6"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            <div className="flex items-start gap-3 md:gap-4 flex-col sm:flex-row">
              <div className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <UserPlus size={24} />
              </div>
              <div className="flex-1">
                <h3 className="heading-md m-0 mb-1" style={{ color: '#fff' }}>
                  Save Your Profile & Get Recommendations
                </h3>
                <p className="text-sm m-0 mb-4" style={{ opacity: 0.9 }}>
                  Create your free MoSPI SmartSkills account to save your FRAC competency profile, 
                  access personalized iGOT &amp; NSSTA training pathways, and track your progress over time.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowAuth(true)}
                    className="brutalist-btn bg-white flex items-center gap-2 px-5 md:px-6 py-2.5 w-full sm:w-auto justify-center"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <CheckCircle size={16} /> Create Account
                  </button>
                  <button
                    onClick={handleRetake}
                    className="brutalist-btn flex items-center gap-2 px-6 py-2.5"
                    style={{
                      background: 'transparent',
                      border: '2px solid rgba(255,255,255,0.5)',
                      color: '#fff',
                    }}
                  >
                    <RotateCcw size={16} /> Retake Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Modal with custom message */}
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          initialView="register"
          customMessage="🎯 Great job on the assessment! Create an account to save your FRAC competency profile and unlock personalized training recommendations."
        />
      </div>
    );
  }

  // ── Determine step description ──────────────────────────────────────
  const getDescription = () => {
    if (hasCompletedDiagnostic && user) {
      return 'Retake the assessment to update your competency profile. Your previous profile data has been pre-filled.';
    }
    if (intakeData) {
      return 'Answer 12 domain-specific questions to identify your competency gaps across the 4 FRAC quadrants.';
    }
    return "Welcome to the MoSPI SmartSkills diagnostic. We'll start by building your officer profile.";
  };

  return (
    <div id="tour-page-diagnostic">
      {/* Page Header */}
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
              ASSESSMENT
            </div>
            <span className="label-mono text-muted">
              FRAC Competency Diagnostic
            </span>
            {!user && (
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
            {getDescription()}
          </p>
        </div>
      </header>

      {/* Assessment Flow */}
      {!intakeData ? (
        <ProfileIntake onComplete={handleIntakeComplete} />
      ) : (
        <DiagnosticAssessment onComplete={handleDiagnosticComplete} />
      )}
    </div>
  );
}
