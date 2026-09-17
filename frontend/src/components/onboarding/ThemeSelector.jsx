import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, Check, Palette, Sun, Moon } from 'lucide-react';

/**
 * ThemeSelector — Onboarding step for choosing a visual theme.
 * Shows all themes as cards with live mini-previews.
 * Selecting a theme instantly applies it to the page.
 */
export default function ThemeSelector({ onComplete }) {
  const { themeKey, themes, themeKeys, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [selectedKey, setSelectedKey] = useState(themeKey);
  const [entered, setEntered] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (key) => {
    setSelectedKey(key);
    setTheme(key); // Apply instantly so user sees the effect
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-8 px-4 py-10 max-w-4xl mx-auto"
      style={{
        minHeight: '80vh',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Palette size={32} style={{ color: 'var(--color-primary)' }} />
          <h2 className="heading-lg" style={{ margin: 0 }}>CHOOSE YOUR THEME</h2>
        </div>
        <p className="text-muted text-sm" style={{ maxWidth: 500, margin: '0 auto' }}>
          Pick a visual identity for your learning experience. You can always change it later from the Dashboard.
        </p>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="flex items-center gap-2 px-4 py-2 border-2 border-ink cursor-pointer transition-all"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-ink)',
          boxShadow: 'var(--shadow-brutal-sm)',
        }}
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        <span className="label-mono text-xs font-bold">
          {isDarkMode ? 'LIGHT MODE' : 'DARK MODE'}
        </span>
      </button>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 w-full">
        {themeKeys.map((key, i) => {
          const t = themes[key];
          const isActive = key === selectedKey;
          const primaryColor = t.vars['--color-primary'];
          const borderColor = t.vars['--color-border'] || t.vars['--color-ink'];
          const canvasColor = t.vars['--color-canvas'];
          const surfaceColor = t.vars['--color-surface'];
          const inkColor = t.vars['--color-ink'];
          const mutedColor = t.vars['--color-muted'];

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className="relative flex flex-col border-4 cursor-pointer transition-all overflow-hidden"
              style={{
                borderColor: isActive ? borderColor : 'var(--color-border-light)',
                backgroundColor: canvasColor,
                boxShadow: isActive ? `6px 6px 0px 0px ${borderColor}` : 'none',
                transform: isActive ? 'translate(-3px, -3px)' : 'none',
                opacity: entered ? 1 : 0,
                animation: entered ? `themeCardIn 0.4s ease ${i * 0.07}s both` : 'none',
              }}
            >
              {/* Active check badge */}
              {isActive && (
                <span
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center border-2 z-10"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: borderColor,
                    color: '#fff',
                    animation: 'checkPop 0.25s ease',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </span>
              )}

              {/* Mini Preview */}
              <div className="p-3 flex flex-col gap-2" style={{ backgroundColor: canvasColor }}>
                {/* Mini header */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.icon}</span>
                  <span
                    className="label-mono text-xs font-black tracking-wider"
                    style={{ color: inkColor }}
                  >
                    {t.label.toUpperCase()}
                  </span>
                </div>

                {/* Mock card preview */}
                <div
                  className="p-2 border-2"
                  style={{
                    backgroundColor: surfaceColor,
                    borderColor: borderColor,
                    boxShadow: t.vars['--shadow-brutal-sm'],
                    borderRadius: t.vars['--border-radius'],
                  }}
                >
                  {/* Mock progress bar */}
                  <div
                    className="h-2 mb-2 border"
                    style={{
                      backgroundColor: canvasColor,
                      borderColor: borderColor,
                      borderRadius: t.vars['--border-radius'],
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '65%',
                        height: '100%',
                        backgroundColor: primaryColor,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>

                  {/* Mock text lines */}
                  <div className="flex flex-col gap-1">
                    <div
                      style={{
                        width: '80%',
                        height: 6,
                        backgroundColor: inkColor,
                        opacity: 0.7,
                        borderRadius: 2,
                      }}
                    />
                    <div
                      style={{
                        width: '55%',
                        height: 6,
                        backgroundColor: mutedColor,
                        opacity: 0.5,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>

                {/* Color swatch row */}
                <div className="flex gap-1 mt-1">
                  {[primaryColor, borderColor, inkColor, mutedColor].map((c, ci) => (
                    <div
                      key={ci}
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor: c,
                        border: `1px solid ${borderColor}`,
                        borderRadius: t.vars['--border-radius'] === '0px' ? 0 : 3,
                      }}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={onComplete}
        className="flex items-center gap-3 px-10 py-4 border-4 border-ink font-black uppercase tracking-widest text-lg cursor-pointer transition-all"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          boxShadow: 'var(--shadow-brutal)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(2px, 2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-brutal-sm)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'var(--shadow-brutal)';
        }}
      >
        Continue to Dashboard
        <ArrowRight size={22} />
      </button>

      {/* Keyframe animations */}
      <style>{`
        @keyframes themeCardIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(15px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes checkPop {
          0% { transform: scale(0); }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
