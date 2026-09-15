import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';

/**
 * InlineLevelQuiz — Interactive quiz embedded within a lesson
 * 
 * Renders quiz questions one-by-one with instant feedback after each answer.
 * Shows a score summary at the end with pass/fail and option to retry.
 * 
 * Props:
 *   quizData   — Array of { question, options, correct_index }
 *   onComplete — Called when user finishes (pass or fail)
 *   accent     — Theme accent color
 */
export default function InlineLevelQuiz({ quizData, onComplete, accent = '#E52E2E' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]); // track all answers
  const [isFinished, setIsFinished] = useState(false);

  if (!quizData || quizData.length === 0) return null;

  const currentQ = quizData[currentIndex];
  const totalQuestions = quizData.length;

  const handleSelect = (index) => {
    if (isRevealed) return;
    setSelectedAnswer(index);
  };

  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    setIsRevealed(true);
    const isCorrect = selectedAnswer === currentQ.correct_index;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, { selected: selectedAnswer, correct: currentQ.correct_index, isCorrect }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setScore(0);
    setAnswers([]);
    setIsFinished(false);
  };

  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 60;

  // ── Finished State ──
  if (isFinished) {
    return (
      <div
        className="border-4 border-ink p-8 bg-surface"
        style={{ boxShadow: 'var(--shadow-brutal-md)', borderRadius: 'var(--border-radius)' }}
      >
        {/* Score Header */}
        <div className="text-center mb-8">
          <div className="mb-3">
            <span style={{ fontSize: 56 }}>{passed ? '🏆' : '📝'}</span>
          </div>
          <h2
            className="heading-xl mb-2"
            style={{ color: passed ? '#22c55e' : '#F59E0B' }}
          >
            {score}/{totalQuestions}
          </h2>
          <p className="label-mono text-lg mb-1" style={{ color: passed ? '#22c55e' : '#F59E0B' }}>
            {passed ? 'QUIZ PASSED!' : 'NEEDS IMPROVEMENT'}
          </p>
          <p className="text-muted text-sm">
            {passed
              ? 'Great work! You can proceed to the next lesson.'
              : 'You need at least 60% to pass. Review the material and try again.'}
          </p>
        </div>

        {/* Question Review */}
        <div className="mb-6">
          <h3 className="heading-sm mb-4">Review</h3>
          {quizData.map((q, i) => {
            const ans = answers[i];
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 mb-2"
                style={{
                  background: ans?.isCorrect ? '#22c55e10' : '#ef444410',
                  border: `2px solid ${ans?.isCorrect ? '#22c55e40' : '#ef444440'}`,
                  borderRadius: 'var(--border-radius)',
                }}
              >
                {ans?.isCorrect ? (
                  <CheckCircle size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                ) : (
                  <XCircle size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold m-0">{q.question}</p>
                  {!ans?.isCorrect && (
                    <p className="text-xs text-muted m-0 mt-1">
                      Correct: <strong>{q.options[q.correct_index]}</strong>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          {!passed && (
            <button
              onClick={handleRetry}
              className="brutalist-btn px-6 py-3 flex items-center gap-2"
              style={{ background: accent, color: '#fff' }}
            >
              <RotateCcw size={16} /> Try Again
            </button>
          )}
          {passed && onComplete && (
            <button
              onClick={onComplete}
              className="brutalist-btn px-6 py-3 flex items-center gap-2"
              style={{ background: '#22c55e', color: '#fff' }}
            >
              <Trophy size={16} /> Continue →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Question View ──
  return (
    <div
      className="border-4 border-ink bg-surface"
      style={{ boxShadow: 'var(--shadow-brutal-md)', borderRadius: 'var(--border-radius)' }}
    >
      {/* Quiz Header */}
      <div
        className="flex items-center justify-between p-4 border-b-4 border-ink"
        style={{ background: accent + '15' }}
      >
        <span className="label-mono text-sm" style={{ color: accent }}>
          QUESTION {currentIndex + 1} OF {totalQuestions}
        </span>
        <span className="label-mono text-sm text-muted">
          Score: {score}/{currentIndex}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2" style={{ background: 'var(--color-border)' }}>
        <div
          style={{
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            height: '100%',
            background: accent,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Question */}
      <div className="p-6 md:p-8">
        <h3 className="heading-md mb-6">{currentQ.question}</h3>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-6">
          {currentQ.options.map((option, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === currentQ.correct_index;
            let borderColor = 'var(--color-border)';
            let bg = 'var(--color-canvas)';

            if (isRevealed) {
              if (isCorrect) {
                borderColor = '#22c55e';
                bg = '#22c55e15';
              } else if (isSelected && !isCorrect) {
                borderColor = '#ef4444';
                bg = '#ef444415';
              }
            } else if (isSelected) {
              borderColor = accent;
              bg = accent + '10';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={isRevealed}
                className="text-left p-4 flex items-center gap-3 transition-all"
                style={{
                  border: `3px solid ${borderColor}`,
                  background: bg,
                  borderRadius: 'var(--border-radius)',
                  cursor: isRevealed ? 'default' : 'pointer',
                  opacity: isRevealed && !isSelected && !isCorrect ? 0.5 : 1,
                }}
              >
                <span
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-black text-sm border-2"
                  style={{
                    borderColor: isRevealed && isCorrect ? '#22c55e' : isSelected ? accent : 'var(--color-border)',
                    background: isRevealed && isCorrect ? '#22c55e' : isSelected ? accent : 'transparent',
                    color: (isRevealed && isCorrect) || isSelected ? '#fff' : 'var(--color-ink)',
                    borderRadius: 4,
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 font-medium">{option}</span>
                {isRevealed && isCorrect && (
                  <CheckCircle size={20} style={{ color: '#22c55e' }} />
                )}
                {isRevealed && isSelected && !isCorrect && (
                  <XCircle size={20} style={{ color: '#ef4444' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm / Next Button */}
        <div className="flex justify-end">
          {!isRevealed ? (
            <button
              onClick={handleConfirm}
              disabled={selectedAnswer === null}
              className="brutalist-btn px-6 py-3"
              style={{
                background: selectedAnswer !== null ? accent : 'var(--color-border)',
                color: selectedAnswer !== null ? '#fff' : 'var(--color-muted)',
                cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
              }}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="brutalist-btn px-6 py-3"
              style={{ background: accent, color: '#fff' }}
            >
              {currentIndex + 1 < totalQuestions ? 'Next Question →' : 'See Results →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
