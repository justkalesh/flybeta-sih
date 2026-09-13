import { CheckCircle, XCircle, FileText, RotateCcw, UserPlus, Award } from 'lucide-react';

const FRAC_LABELS = {
  comp_statistical: { label: 'Statistical', color: '#3B82F6', icon: '📊' },
  comp_technical: { label: 'Technical', color: '#8B5CF6', icon: '💻' },
  comp_digital_governance: { label: 'Digital Governance', color: '#10B981', icon: '🏛️' },
  comp_behavioural: { label: 'Behavioural', color: '#F59E0B', icon: '🤝' },
};

/**
 * DiagnosticResults
 * 
 * Post-submission results overview:
 * - Total score with visual gauge
 * - Per-section breakdown with MCQ correct/wrong + descriptive AI feedback
 * - Question-by-question review
 */
export default function DiagnosticResults({ results, quizData, answers, onRetake, showSignup, onSignup }) {
  const { total_score, max_score, section_scores, ai_feedback } = results;
  const percentage = Math.round((total_score / max_score) * 100);

  const getGrade = () => {
    if (percentage >= 80) return { text: 'Excellent', color: '#22c55e', emoji: '🏆' };
    if (percentage >= 60) return { text: 'Good', color: '#3B82F6', emoji: '👍' };
    if (percentage >= 40) return { text: 'Needs Improvement', color: '#F59E0B', emoji: '📈' };
    return { text: 'Critical Gaps Found', color: '#DC2626', emoji: '⚠️' };
  };

  const grade = getGrade();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Score Summary Card */}
      <div
        className="brutalist-card p-8 mb-8 text-center bg-surface"
        style={{ borderColor: grade.color }}
      >
        <div className="mb-4">
          <span style={{ fontSize: 48 }}>{grade.emoji}</span>
        </div>
        <h2 className="heading-xl mb-2" style={{ color: grade.color }}>
          {total_score.toFixed(1)} / {max_score}
        </h2>
        <p className="label-mono text-lg mb-4" style={{ color: grade.color }}>
          {grade.text} — {percentage}%
        </p>

        {/* Section Score Bars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {Object.entries(section_scores).map(([quadrant, data]) => {
            const meta = FRAC_LABELS[quadrant] || { label: quadrant, color: '#666' };
            const sectionPct = Math.round((data.total / 8) * 100);
            return (
              <div key={quadrant} className="text-center">
                <div
                  className="label-mono text-xs mb-1 px-2 py-1 inline-block"
                  style={{ background: meta.color, color: '#fff' }}
                >
                  {meta.label}
                </div>
                <div className="heading-md" style={{ color: meta.color }}>
                  {data.total.toFixed(1)}/8
                </div>
                <div className="text-xs text-muted">
                  MCQ: {data.mcq_score}/3 · Desc: {data.desc_score?.toFixed(1) || 0}/5
                </div>
                <div
                  className="w-full h-2 mt-2 overflow-hidden"
                  style={{ background: 'var(--color-border)', borderRadius: 4 }}
                >
                  <div
                    style={{
                      width: `${sectionPct}%`,
                      height: '100%',
                      background: meta.color,
                      borderRadius: 4,
                      transition: 'width 0.8s ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question-by-Question Review */}
      {quizData?.sections?.map((section) => {
        const quadrant = section.frac_quadrant;
        const meta = FRAC_LABELS[quadrant] || { label: quadrant, color: '#666', icon: '📝' };
        const userAnswers = answers[quadrant] || {};
        const feedback = ai_feedback[quadrant];

        return (
          <div key={quadrant} className="mb-8">
            <h3
              className="heading-md mb-4 pb-2 flex items-center gap-2"
              style={{ borderBottom: `3px solid ${meta.color}` }}
            >
              <span>{meta.icon}</span> {meta.label} Section
            </h3>

            {/* MCQs Review */}
            {section.mcqs.map((mcq, i) => {
              const userAnswer = userAnswers.mcq_answers?.[i];
              const isCorrect = userAnswer === mcq.correct_answer;
              return (
                <div
                  key={i}
                  className="brutalist-card p-5 mb-3 bg-surface"
                  style={{
                    borderLeft: `4px solid ${isCorrect ? '#22c55e' : '#DC2626'}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <XCircle size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: 2 }} />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-2 text-sm">{mcq.question_text}</p>
                      {!isCorrect && userAnswer && (
                        <p className="text-xs mb-1" style={{ color: '#DC2626' }}>
                          Your answer: {userAnswer}
                        </p>
                      )}
                      <p className="text-xs mb-1" style={{ color: '#22c55e' }}>
                        ✓ Correct: {mcq.correct_answer}
                      </p>
                      <p className="text-xs text-muted mt-2">
                        💡 {mcq.explanation}
                      </p>
                    </div>
                    <span className="label-mono text-xs" style={{ color: isCorrect ? '#22c55e' : '#DC2626' }}>
                      {isCorrect ? '1/1' : '0/1'}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Descriptive Review */}
            <div
              className="brutalist-card p-5 mb-3 bg-surface"
              style={{ borderLeft: `4px solid ${meta.color}` }}
            >
              <div className="flex items-start gap-3">
                <FileText size={20} style={{ color: meta.color, flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1">
                  <p className="font-semibold mb-2 text-sm">{section.descriptive.question_text}</p>
                  <div
                    className="p-3 mb-3 text-sm"
                    style={{
                      background: 'var(--color-canvas)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius)',
                      lineHeight: 1.6,
                    }}
                  >
                    <span className="label-mono text-xs text-muted block mb-1">Your Answer:</span>
                    {userAnswers.descriptive_answer || <em className="text-muted">No answer provided</em>}
                  </div>
                  {feedback && (
                    <div
                      className="p-3 text-sm"
                      style={{
                        background: `${meta.color}10`,
                        border: `1px solid ${meta.color}40`,
                        borderRadius: 'var(--border-radius)',
                      }}
                    >
                      <span className="label-mono text-xs block mb-1" style={{ color: meta.color }}>
                        AI Feedback — {feedback.score}/5
                      </span>
                      {feedback.feedback}
                    </div>
                  )}
                </div>
                {feedback && (
                  <span
                    className="label-mono text-xs px-2 py-1"
                    style={{
                      background: feedback.score >= 3.5 ? '#22c55e' : feedback.score >= 2 ? '#F59E0B' : '#DC2626',
                      color: '#fff',
                    }}
                  >
                    {feedback.score}/5
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="brutalist-btn px-6 py-3 flex items-center gap-2"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
        >
          <Award size={18} /> View FRAC Profile on Dashboard
        </button>
        {showSignup && (
          <button
            onClick={onSignup}
            className="brutalist-btn px-6 py-3 flex items-center gap-2"
            style={{ background: '#059669', color: '#fff' }}
          >
            <UserPlus size={18} /> Save Profile & Create Account
          </button>
        )}
        <button
          onClick={onRetake}
          className="brutalist-btn px-6 py-3 flex items-center gap-2"
          style={{ background: 'var(--color-surface)' }}
        >
          <RotateCcw size={18} /> Retake Assessment
        </button>
      </div>
    </div>
  );
}
