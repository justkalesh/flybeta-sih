import { X, Rocket, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingChoiceModal({ isOpen, onClose, onLoginClick }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNew = () => {
    onClose();
    navigate('/onboarding');
  };

  const handleReturning = () => {
    onClose();
    onLoginClick();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md border-4"
        style={{
          background: 'var(--color-canvas)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-brutal-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-transparent border-2 p-1.5 cursor-pointer transition-colors z-10"
          style={{
            borderColor: 'var(--color-canvas)',
            color: 'var(--color-canvas)',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div
          className="px-6 py-4"
          style={{ background: 'var(--color-ink)', color: 'var(--color-canvas)' }}
        >
          <h2
            className="heading-md m-0"
            style={{ color: 'var(--color-canvas)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Welcome to FlyBeta
          </h2>
          <p className="text-sm mt-1 opacity-80 font-mono" style={{ color: 'var(--color-canvas)' }}>
            How would you like to begin?
          </p>
        </div>

        {/* Options */}
        <div className="p-6 flex flex-col gap-4">
          {/* New User */}
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-4 p-5 border-4 bg-[#059669] text-white font-black text-left uppercase tracking-wider transition-all cursor-pointer"
            style={{
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-brutal)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(6px, 6px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-brutal-sm)';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-brutal-sm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-brutal)';
            }}
          >
            <div className="shrink-0 w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center">
              <Rocket size={24} />
            </div>
            <div>
              <div className="text-lg">🚀 I'm New Here</div>
              <div className="text-xs font-normal normal-case tracking-normal mt-1 opacity-90">
                Take the skill gap test & create your account
              </div>
            </div>
          </button>

          {/* Returning User */}
          <button
            onClick={handleReturning}
            className="w-full flex items-center gap-4 p-5 border-4 font-black text-left uppercase tracking-wider transition-all cursor-pointer"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-ink)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-brutal)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(6px, 6px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-brutal-sm)';
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-brutal-sm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-brutal)';
            }}
          >
            <div
              className="shrink-0 w-12 h-12 border-2 flex items-center justify-center"
              style={{
                background: 'var(--color-canvas)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-ink)',
              }}
            >
              <UserCheck size={24} />
            </div>
            <div>
              <div className="text-lg">👋 Welcome Back</div>
              <div className="text-xs font-normal normal-case tracking-normal mt-1 opacity-70">
                Sign in to continue your learning journey
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
