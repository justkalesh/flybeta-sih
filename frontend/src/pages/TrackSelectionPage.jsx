import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDomains, getCachedDomainsList } from '../services/api';
import TrackCard from '../components/ui/TrackCard';
import { MOSPI_TRACKS } from '../data/tracksData';
import { useCompetency } from '../context/CompetencyContext';
import { useTheme } from '../context/ThemeContext';
import { Cloud, Bot, BarChart3, Database } from 'lucide-react';

const THEME_IMAGES = {
  'doraemon': {
    'cloud': '/doremon-theme/doremon.webp',
    'ai':    '/doremon-theme/sizuka.webp',
    'data':  '/doremon-theme/nobita.webp',
  },
  'shinchan': {
    'cloud': '/shinchan-theme/shinchan.webp',
    'ai':    '/shinchan-theme/bo chain.webp',
    'data':  '/shinchan-theme/meni.webp',
  },
  'princess': {
    'cloud': '/disney-princess-thene/rapunzel_new.webp',
    'ai':    '/disney-princess-thene/Mulan.webp',
    'data':  '/disney-princess-thene/belle.webp',
  },
  'anime': {
    'cloud': '/anime-theme/zoro.webp',
    'ai':    '/anime-theme/luffy.webp',
    'data':  '/anime-theme/nami.webp',
  },
};

const TAG_TO_IMAGE_KEY = {
  'comp_statistical': 'data',
  'comp_technical': 'ai',
  'comp_digital_governance': 'cloud',
  'comp_behavioural': 'data',
};

const TAG_TO_ICON = {
  'comp_statistical': Database,
  'comp_technical': Bot,
  'comp_digital_governance': Cloud,
  'comp_behavioural': BarChart3,
};

export default function TrackSelectionPage() {
  const { profile, hasCompletedDiagnostic } = useCompetency();
  const { themeKey } = useTheme();

  const cached = getCachedDomainsList();
  const [domains, setDomains] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    // SWR pattern for legacy tracks
    getDomains()
      .then((data) => {
        const results = data.results || data;
        const finalResults = Array.isArray(results) ? results : [];
        setDomains(finalResults);
      })
      .catch((err) => {
        if (!cached) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // If we have a profile, sort the tracks by score (ascending: weak areas first)
  // Tracks without a matching score (e.g. key missing) will fall back to 0.
  const sortedTracks = [...MOSPI_TRACKS].sort((a, b) => {
    if (!profile) return 0;
    const scoreA = profile[a.frac_competency_tag] ?? 0;
    const scoreB = profile[b.frac_competency_tag] ?? 0;
    return scoreA - scoreB;
  });

  return (
    <div>
      {/* Hero Header */}
      <header className="relative mb-8 md:mb-12">
        <div
          className="relative z-10 bg-surface border-2 border-ink p-5 md:p-8 inline-block"
          style={{ boxShadow: 'var(--shadow-brutal-lg)' }}
        >
          <h1 className="heading-xl m-0 leading-none text-4xl md:text-5xl" style={{ color: 'var(--color-primary)' }}>
            MoSPI Learning Pathways
          </h1>
          <p className="mt-4 max-w-2xl text-muted text-sm md:text-base mb-0">
            Select a specialized discipline to build capacity in key statistical methodologies and technologies.
          </p>
        </div>
      </header>

      {/* Diagnostic Prompt Banner */}
      {!hasCompletedDiagnostic && (
        <div className="brutalist-card p-6 mb-10 flex items-center justify-between flex-wrap gap-4" style={{ borderLeftWidth: '6px', borderLeftColor: 'var(--color-primary)' }}>
          <div>
            <h3 className="heading-sm m-0">Take the FRAC Baseline Diagnostic</h3>
            <p className="text-muted text-sm m-0 mt-1">
              Complete a 5-minute assessment to identify competency gaps and receive personalized pathway recommendations.
            </p>
          </div>
          <Link to="/diagnostic" className="brutalist-btn brutalist-btn-primary no-underline whitespace-nowrap">
            Start Diagnostic
          </Link>
        </div>
      )}

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Legacy Tracks (exclude any that overlap with MoSPI tracks) */}
        {domains
          .filter((d) => !MOSPI_TRACKS.some((t) => t.id === d.name))
          .map((domain) => (
            <TrackCard key={`legacy-${domain.id || domain.name}`} domain={domain} />
          ))}

        {/* MoSPI Tracks */}
        {sortedTracks.map((track, index) => {
          const score = profile?.[track.frac_competency_tag];
          const isGap = hasCompletedDiagnostic && score !== undefined && score < 60;

          return (
            <article
              key={track.id}
              id={index === 0 ? 'tour-first-track' : undefined}
              className="brutalist-card flex flex-col overflow-hidden"
              style={{
                borderColor: isGap ? '#DC2626' : 'var(--color-ink)',
                borderWidth: isGap ? '4px' : '2px',
              }}
            >
              <div
                className="h-36 md:h-52 border-b-2 relative overflow-hidden flex items-center justify-center group"
                style={{
                  borderColor: isGap ? '#DC2626' : 'var(--color-border)',
                  background: isGap ? '#FEE2E2' : 'var(--color-canvas)',
                }}
              >
                {/* Track Code Badge */}
                <div
                  className="absolute top-2 left-2 md:top-4 md:left-4 z-20 label-mono px-2 py-1 border text-xs md:text-sm"
                  style={{
                    background: isGap ? '#DC2626' : 'var(--color-primary)',
                    color: themeKey === 'shinchan' ? 'var(--color-ink)' : 'var(--color-canvas)',
                    borderColor: isGap ? '#DC2626' : 'var(--color-border)',
                  }}
                >
                  TS-0{index + 1}
                </div>

                {/* Theme character image OR Lucide icon fallback */}
                {(() => {
                  const imageKey = TAG_TO_IMAGE_KEY[track.frac_competency_tag];
                  const characterImg = THEME_IMAGES[themeKey]?.[imageKey];
                  const IconComponent = TAG_TO_ICON[track.frac_competency_tag];

                  if (characterImg && themeKey !== 'neo-brutalism') {
                    return (
                      <img
                        src={characterImg}
                        alt={`${track.title} character`}
                        className="absolute inset-0 w-full h-full object-contain object-bottom p-2 group-hover:-translate-y-2 transition-transform duration-300"
                      />
                    );
                  }
                  return (
                    <IconComponent
                      size={72}
                      strokeWidth={1.5}
                      style={{ color: isGap ? '#DC2626' : 'var(--color-primary)', opacity: 0.3 }}
                    />
                  );
                })()}
              </div>

              {/* Card Body (Matching legacy TrackCard) */}
              <div className="p-4 md:p-6 flex-grow flex flex-col" style={{ background: isGap ? '#FEF2F2' : 'var(--color-surface)' }}>
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className="brutalist-badge"
                      style={{
                        background: isGap ? '#DC2626' : 'var(--color-primary)',
                        color: themeKey === 'shinchan' ? 'var(--color-ink)' : 'var(--color-canvas)',
                        borderColor: isGap ? '#DC2626' : 'var(--color-ink)',
                      }}
                    >
                      {isGap ? 'RECOMMENDED PRIORITY' : 'TRACK'}
                    </span>
                    {hasCompletedDiagnostic && score !== undefined && (
                      <span className="label-mono text-sm" style={{ color: isGap ? '#DC2626' : 'var(--color-emerald)' }}>
                        Competency: {score}%
                      </span>
                    )}
                  </div>
                  <h2 className="heading-md mt-2">{track.title}</h2>
                </div>

                {/* Level info */}
                <div className="border-t-2 pt-4 flex-grow" style={{ borderColor: isGap ? '#FCA5A5' : 'var(--color-border)' }}>
                  <div className="flex items-center gap-2 mb-2 text-muted">
                    <span className="label-mono uppercase">{track.level}</span>
                    <span className="text-border-light">•</span>
                    <span className="label-mono uppercase">{track.duration}</span>
                  </div>

                  {/* Modules preview */}
                  <ul className="list-none p-0 m-0">
                    {track.modules.slice(0, 3).map((mod, i) => (
                      <li
                        key={mod.id}
                        className="border-b border-border-light py-2 flex items-center gap-2 text-sm"
                        style={{ borderColor: isGap ? '#FCA5A5' : 'var(--color-border-light)' }}
                      >
                        <span
                          className="w-6 h-6 flex items-center justify-center border text-xs font-bold shrink-0"
                          style={{
                            background: isGap ? '#FEE2E2' : 'var(--color-canvas)',
                            borderColor: isGap ? '#FCA5A5' : 'var(--color-border)',
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="truncate">{mod.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                  to={`/track/${track.id}`}
                  className="brutalist-btn brutalist-btn-primary w-full text-center mt-4 no-underline"
                  style={isGap ? {
                    background: '#DC2626',
                    color: '#ffffff',
                    borderColor: 'var(--color-ink)',
                  } : {}}
                >
                  Start Track →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
