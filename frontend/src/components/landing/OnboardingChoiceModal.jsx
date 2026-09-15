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
        className="relative w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{ background: 'var(--color-canvas, #F9F8F6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-transparent border-2 border-black p-1.5 cursor-pointer hover:bg-red-100 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="bg-black text-white px-6 py-4">
          <h2 className="heading-md text-white m-0" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Welcome to FlyBeta
          </h2>
          <p className="text-sm mt-1 opacity-80 font-mono">How would you like to begin?</p>
        </div>

        {/* Options */}
        <div className="p-6 flex flex-col gap-4">
          {/* New User */}
          <button
            onClick={handleNew}
            className="w-full flex items-center gap-4 p-5 border-4 border-black bg-[#059669] text-white font-black text-left uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all cursor-pointer"
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
            className="w-full flex items-center gap-4 p-5 border-4 border-black text-black font-black text-left uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all cursor-pointer"
            style={{ background: 'var(--color-surface, #ffffff)' }}
          >
            <div className="shrink-0 w-12 h-12 border-2 border-black flex items-center justify-center" style={{ background: 'var(--color-canvas, #F9F8F6)' }}>
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
