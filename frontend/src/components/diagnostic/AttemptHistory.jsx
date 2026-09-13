import { RotateCcw, TrendingUp } from 'lucide-react';

const FRAC_LABELS = {
  statistical: { label: 'Statistical', color: '#3B82F6' },
  technical: { label: 'Technical', color: '#8B5CF6' },
  digital_governance: { label: 'Digital Gov', color: '#10B981' },
  behavioural: { label: 'Behavioural', color: '#F59E0B' },
};

/**
 * AttemptHistory
 * 
 * Table of past diagnostic attempts with per-section scores.
 */
export default function AttemptHistory({ attempts, onRetake }) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="brutalist-card p-10 text-center bg-surface max-w-lg mx-auto">
        <TrendingUp size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
        <h3 className="heading-md mb-2">No Attempts Yet</h3>
        <p className="text-muted text-sm mb-6">
          Take your first AI-powered Skill Gap Assessment to start tracking your progress.
        </p>
        <button
          onClick={onRetake}
          className="brutalist-btn bg-primary text-white px-6 py-3 flex items-center gap-2 mx-auto"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
        >
          <RotateCcw size={16} /> Start Assessment
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-6 pb-2 border-b-2" style={{ borderColor: 'var(--color-ink)' }}>
        <h3 className="heading-lg">📋 Assessment History</h3>
        <span className="label-mono text-muted">
          {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '3px solid var(--color-ink)' }}>
              <th className="label-mono text-left py-3 px-4">#</th>
              <th className="label-mono text-left py-3 px-4">Date & Time</th>
              <th className="label-mono text-center py-3 px-4" style={{ color: '#3B82F6' }}>
                Statistical (/8)
              </th>
              <th className="label-mono text-center py-3 px-4" style={{ color: '#8B5CF6' }}>
                Technical (/8)
              </th>
              <th className="label-mono text-center py-3 px-4" style={{ color: '#10B981' }}>
                Digital Gov (/8)
              </th>
              <th className="label-mono text-center py-3 px-4" style={{ color: '#F59E0B' }}>
                Behavioural (/8)
              </th>
              <th className="label-mono text-center py-3 px-4">Total (/32)</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt, i) => {
              const pct = Math.round((attempt.total_score / 32) * 100);
              return (
                <tr
                  key={attempt.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: i % 2 === 0 ? 'var(--color-canvas)' : 'var(--color-surface)',
                  }}
                >
                  <td className="py-3 px-4 label-mono" style={{ color: 'var(--color-muted)' }}>
                    {i + 1}
                  </td>
                  <td className="py-3 px-4 label-mono text-sm">
                    {new Date(attempt.attempted_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}{' '}
                    {new Date(attempt.attempted_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ScoreBadge score={attempt.score_statistical} max={9} color="#3B82F6" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ScoreBadge score={attempt.score_technical} max={9} color="#8B5CF6" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ScoreBadge score={attempt.score_digital_governance} max={9} color="#10B981" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ScoreBadge score={attempt.score_behavioural} max={9} color="#F59E0B" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="label-mono px-3 py-1 inline-block font-bold"
                      style={{
                        background: pct >= 70 ? '#22c55e' : pct >= 40 ? '#F59E0B' : '#DC2626',
                        color: '#fff',
                      }}
                    >
                      {attempt.total_score.toFixed(1)} ({pct}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onRetake}
          className="brutalist-btn px-6 py-3 flex items-center gap-2 mx-auto"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
        >
          <RotateCcw size={16} /> Take New Assessment
        </button>
      </div>
    </div>
  );
}

function ScoreBadge({ score, max, color }) {
  const pct = Math.round((score / max) * 100);
  return (
    <span
      className="label-mono text-xs px-2 py-1 inline-block"
      style={{
        background: `${color}20`,
        color: color,
        fontWeight: 700,
      }}
    >
      {score.toFixed(1)}
    </span>
  );
}
