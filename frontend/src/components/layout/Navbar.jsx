import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';

const NAV_LINKS = [
  { label: 'Tracks', path: '/tracks' },
  { label: 'Labs', path: '/labs' },
  { label: 'Vision', path: '/vision' },
];

const AUTH_NAV_LINKS = [
  { label: 'Diagnostic', path: '/diagnostic' },
  { label: 'Tracks', path: '/tracks' },
  { label: 'Pathways', path: '/recommendations' },
  { label: 'Labs', path: '/labs' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Admin', path: '/admin' },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeKey, themes, themeKeys, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-3 lg:px-12 h-16 lg:h-20 bg-surface"
         style={{ boxShadow: 'var(--shadow-brutal)', borderBottom: 'var(--border-width) solid var(--color-border)' }}>
      {/* Left: Logo + Nav Links (Desktop) */}
      <div className="flex items-center gap-2 lg:gap-8">
        <Logo to="/tracks" />

        {/* Desktop Nav Links — only visible at lg (1024px+) */}
        <div className="hidden lg:flex gap-2">
          {(user ? AUTH_NAV_LINKS : NAV_LINKS).map(({ label, path }) => {
            const isActive = path === '/tracks'
              ? location.pathname === '/tracks' || location.pathname.startsWith('/track')
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`label-mono px-4 py-2 no-underline border-2 transition-all ${
                  isActive
                    ? 'bg-primary text-white border-ink'
                    : 'text-muted border-transparent hover:border-ink hover:bg-canvas'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: Desktop actions + Mobile hamburger */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Desktop-only: Dark Mode + Logout */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="brutalist-badge bg-canvas text-ink cursor-pointer hover:bg-border-light transition-colors p-2"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user && (
            <button
              onClick={logout}
              className="brutalist-badge bg-red-100 text-red-700 cursor-pointer hover:bg-red-200 transition-colors p-2"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Mobile/Tablet: Hamburger — visible below lg */}
        <button
          className="lg:!hidden brutalist-badge bg-canvas text-ink cursor-pointer hover:bg-border-light transition-colors p-2 mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          title="Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown — visible below lg */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden absolute top-16 left-0 w-full bg-surface border-b-2 border-ink shadow-[var(--shadow-brutal)] flex flex-col z-40"
        >
          {(user ? AUTH_NAV_LINKS : NAV_LINKS).map(({ label, path }) => {
            const isActive = path === '/tracks'
              ? location.pathname === '/tracks' || location.pathname.startsWith('/track')
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`label-mono px-6 py-4 border-b border-border-light last:border-b-0 no-underline transition-all ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-ink hover:bg-canvas'
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Mobile footer: Dark Mode + Logout */}
          <div className="flex items-center justify-between px-6 py-3 border-t-2 border-ink bg-canvas">
            <button
              onClick={toggleDarkMode}
              className="brutalist-badge bg-surface text-ink cursor-pointer hover:bg-border-light transition-colors p-2 flex items-center gap-2"
            >
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              <span className="label-mono text-xs">{isDarkMode ? 'Dark' : 'Light'}</span>
            </button>

            {user && (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="brutalist-badge bg-red-100 text-red-700 cursor-pointer hover:bg-red-200 transition-colors p-2 flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="label-mono text-xs">Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
