import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Logo from '../ui/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';
import OnboardingChoiceModal from './OnboardingChoiceModal';
import { useState } from 'react';

export default function LandingNavbar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="relative z-20 flex items-center w-full px-8 py-4">
      {/* Left: Logo */}
      <Logo to="/" />

      {/* Center: Marketing Links — absolutely centered */}
      <div className="hidden md:flex items-center gap-8 font-semibold text-ink absolute left-1/2 -translate-x-1/2">
        <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          Home
        </a>
        <a href="#about-us" onClick={(e) => scrollToSection(e, 'about-us')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          About Us
        </a>
        <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          How it Works
        </a>
        <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          Contact
        </a>
      </div>

      {/* Right: Dashboard/Get Started + Theme Toggle */}
      <div className="flex items-center gap-4 ml-auto">
        {user ? (
          <Link
            to="/dashboard"
            className="bg-black text-white px-6 py-2.5 font-bold hover:bg-[var(--color-primary)] hover:text-black border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-sm no-underline"
          >
            Dashboard
          </Link>
        ) : (
          <button
            onClick={() => setIsChoiceOpen(true)}
            className="bg-black text-white px-6 py-2.5 font-bold hover:bg-[#EAB308] hover:text-black border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-sm cursor-pointer"
          >
            GET STARTED
          </button>
        )}

        <button
          onClick={toggleDarkMode}
          className="bg-transparent border-2 border-ink text-ink p-2 hover:bg-canvas transition-colors cursor-pointer"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Onboarding Choice Modal */}
      <OnboardingChoiceModal
        isOpen={isChoiceOpen}
        onClose={() => setIsChoiceOpen(false)}
        onLoginClick={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal (opened when "Welcome Back" is clicked) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialView="login"
        customMessage="Welcome back! Sign in to continue your journey."
      />
    </nav>
  );
}
