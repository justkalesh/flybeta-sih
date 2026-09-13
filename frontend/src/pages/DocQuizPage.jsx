import { useState, useRef } from 'react';
import { generateDocQuiz } from '../services/api';
import LabsSubNav from '../components/layout/LabsSubNav';

const FRAC_LABELS = {
  comp_statistical: { label: 'Statistical', color: '#3B82F6' },
  comp_technical: { label: 'Technical', color: '#8B5CF6' },
  comp_digital_governance: { label: 'Digital Gov', color: '#10B981' },
  comp_behavioural: { label: 'Behavioural', color: '#F59E0B' },
};

const DIFFICULTY_OPTIONS = ['easy', 'intermediate', 'advanced'];

export default function DocQuizPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quiz state
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (f) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.pptx')) {
      setError('Only PDF (.pdf) and PowerPoint (.pptx) files are supported.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    setError(null);
    setFile(f);
    setQuizData(null);
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setQuizData(null);
    setSelectedAnswers({});
    setSubmitted(false);

    try {
      const data = await generateDocQuiz(file, numQuestions, difficulty);
      setQuizData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex, option) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setFile(null);
    setQuizData(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setError(null);
  };

  const score = quizData
    ? quizData.questions.reduce((acc, q, i) => {
        return acc + (selectedAnswers[i] === q.correct_answer ? 1 : 0);
      }, 0)
    : 0;

  return (
    <div id="tour-page-quiz">
      <LabsSubNav />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <header className="mb-10 border-b-2 border-ink pb-8">
        <h1 className="heading-xl mb-4 tracking-tighter">DOC QUIZ ENGINE</h1>
        <p
          className="text-lg max-w-2xl"
          style={{
            borderLeft: '4px solid var(--color-primary)',
            paddingLeft: '16px',
            color: 'var(--color-muted)',
            lineHeight: 1.6,
          }}
        >
          Upload any MoSPI statistical manual, circular, or training document (PDF/PPTX).
          AI extracts key concepts and generates FRAC-tagged MCQs with instant grading and explanations.
        </p>
      </header>

      {/* ── Upload Section ──────────────────────────────────────── */}
      {!quizData && (
        <section className="mb-16">
          <div className="brutalist-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-ink">
              <h2 className="heading-md flex items-center gap-2">📄 Document Upload</h2>
            </div>

            {/* Drop Zone */}
            <div
              className="relative flex flex-col items-center justify-center gap-4 py-16 px-8 cursor-pointer transition-all"
              style={{
                border: dragActive
                  ? '3px solid var(--color-primary)'
                  : '3px dashed var(--color-border-light)',
                background: dragActive
                  ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                  : 'var(--color-canvas)',
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
                }}
              />

              {file ? (
                <>
                  <span style={{ fontSize: '3rem' }}>📎</span>
                  <p className="heading-md text-center">{file.name}</p>
                  <p className="label-mono text-muted">
                    {(file.size / 1024).toFixed(0)} KB • Click to change
                  </p>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '3rem' }}>📤</span>
                  <p className="heading-md text-center">
                    Drop your PDF or PPTX here
                  </p>
                  <p className="label-mono text-muted">
                    or click to browse • Max 5MB
                  </p>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-end gap-4">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {/* Question Count */}
                <div className="flex flex-col gap-1">
                  <label className="label-mono text-muted">Questions</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={3}
                      max={10}
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span
                      className="label-mono px-2 py-1"
                      style={{
                        border: '2px solid var(--color-ink)',
                        background: 'var(--color-surface)',
                        minWidth: '36px',
                        textAlign: 'center',
                      }}
                    >
                      {numQuestions}
                    </span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-1">
                  <label className="label-mono text-muted">Difficulty</label>
                  <div className="flex gap-1">
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className="label-mono px-3 py-1 transition-all cursor-pointer"
                        style={{
                          border: '2px solid var(--color-ink)',
                          background:
                            difficulty === d
                              ? 'var(--color-primary)'
                              : 'var(--color-surface)',
                          color:
                            difficulty === d
                              ? 'var(--color-canvas)'
                              : 'var(--color-ink)',
                          fontWeight: difficulty === d ? 900 : 400,
                        }}
                      >
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !file}
                className={`brutalist-btn brutalist-btn-primary w-full md:w-auto ${
                  loading || !file ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {loading ? '⏳ Generating...' : '🧠 Generate Quiz'}
              </button>
            </div>

            {error && (
              <p className="mt-4 label-mono text-primary">{error}</p>
            )}
          </div>
        </section>
      )}

      {/* ── Loading State ──────────────────────────────────────── */}
      {loading && (
        <section className="mb-16">
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="brutalist-card p-6 animate-pulse"
                style={{ minHeight: '100px', opacity: 0.4 }}
              >
                <div className="h-5 w-1/3 bg-border-light mb-3" />
                <div className="h-4 w-full bg-border-light mb-2" />
                <div className="h-4 w-2/3 bg-border-light" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quiz Results ──────────────────────────────────────── */}
      {quizData && !loading && (
        <section>
          {/* Header Bar */}
          <div className="flex flex-wrap justify-between items-end mb-8 pb-2 border-b-2 border-ink gap-4">
            <div>
              <h3 className="heading-lg">
                {submitted ? '📊 RESULTS' : '📝 ANSWER THE QUIZ'}
              </h3>
              <p className="label-mono text-muted mt-1">
                Source: {quizData.filename} • {quizData.num_questions} questions •{' '}
                {quizData.difficulty.toUpperCase()}
              </p>
            </div>
            {submitted && (
              <div
                className="flex items-center gap-3 px-4 py-2"
                style={{
                  border: '3px solid var(--color-ink)',
                  background:
                    score === quizData.questions.length
                      ? '#22c55e'
                      : score >= quizData.questions.length / 2
                      ? 'var(--color-primary)'
                      : '#ef4444',
                  color: '#fff',
                  boxShadow: 'var(--shadow-brutal-sm)',
                }}
              >
                <span className="heading-md" style={{ color: '#fff' }}>
                  {score}/{quizData.questions.length}
                </span>
                <span className="label-mono" style={{ color: '#fff' }}>
                  {score === quizData.questions.length
                    ? 'PERFECT!'
                    : score >= quizData.questions.length / 2
                    ? 'PASSED'
                    : 'NEEDS REVIEW'}
                </span>
              </div>
            )}
          </div>

          {/* Question Cards */}
          <div className="flex flex-col gap-6 pb-8">
            {quizData.questions.map((q, qIndex) => {
              const isCorrect = selectedAnswers[qIndex] === q.correct_answer;
              const hasAnswered = selectedAnswers[qIndex] !== undefined;
              const frac = FRAC_LABELS[q.frac_quadrant] || FRAC_LABELS.comp_statistical;

              return (
                <div
                  key={qIndex}
                  className="brutalist-card p-6"
                  style={{
                    borderLeftWidth: '6px',
                    borderLeftColor: submitted
                      ? isCorrect
                        ? '#22c55e'
                        : '#ef4444'
                      : 'var(--color-ink)',
                    animation: 'cardSlideIn 0.4s ease-out both',
                    animationDelay: `${qIndex * 80}ms`,
                  }}
                >
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className="label-mono px-2 py-1"
                      style={{
                        background: 'var(--color-ink)',
                        color: 'var(--color-canvas)',
                      }}
                    >
                      Q{q.question_number}
                    </span>
                    <span
                      className="label-mono px-2 py-1"
                      style={{
                        background: frac.color,
                        color: '#fff',
                      }}
                    >
                      {frac.label}
                    </span>
                    <span
                      className="label-mono px-2 py-1 ml-auto"
                      style={{
                        background: 'var(--color-border-light)',
                        border: '1px solid var(--color-ink)',
                      }}
                    >
                      {q.difficulty?.toUpperCase()}
                    </span>
                  </div>

                  {/* Question Text */}
                  <p className="heading-md mb-4 leading-snug">{q.question_text}</p>

                  {/* Options */}
                  <div className="flex flex-col gap-2 mb-4">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const isCorrectOption = option === q.correct_answer;

                      let optBg = 'var(--color-canvas)';
                      let optBorder = 'var(--color-border-light)';
                      let optWeight = 400;

                      if (submitted) {
                        if (isCorrectOption) {
                          optBg = '#dcfce7';
                          optBorder = '#22c55e';
                          optWeight = 700;
                        } else if (isSelected && !isCorrectOption) {
                          optBg = '#fecaca';
                          optBorder = '#ef4444';
                        }
                      } else if (isSelected) {
                        optBg = 'color-mix(in srgb, var(--color-primary) 15%, transparent)';
                        optBorder = 'var(--color-primary)';
                        optWeight = 700;
                      }

                      return (
                        <button
                          key={oIndex}
                          type="button"
                          onClick={() => handleSelectAnswer(qIndex, option)}
                          disabled={submitted}
                          className="text-left px-4 py-3 transition-all"
                          style={{
                            border: `2px solid ${optBorder}`,
                            background: optBg,
                            fontWeight: optWeight,
                            cursor: submitted ? 'default' : 'pointer',
                            color: 'var(--color-ink)',
                          }}
                        >
                          <span className="label-mono mr-2" style={{ opacity: 0.5 }}>
                            {String.fromCharCode(65 + oIndex)}.
                          </span>
                          {option}
                          {submitted && isCorrectOption && ' ✓'}
                          {submitted && isSelected && !isCorrectOption && ' ✗'}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (shown after submit) */}
                  {submitted && (
                    <div
                      className="p-4 mt-2"
                      style={{
                        background: 'var(--color-canvas)',
                        border: '1px solid var(--color-border-light)',
                      }}
                    >
                      <p className="label-mono mb-2" style={{ color: 'var(--color-primary)' }}>
                        💡 Explanation
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Reset Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pb-12">
            {!submitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < quizData.questions.length}
                className={`brutalist-btn brutalist-btn-primary w-full md:w-auto ${
                  Object.keys(selectedAnswers).length < quizData.questions.length
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                }`}
              >
                ✅ Submit Answers ({Object.keys(selectedAnswers).length}/{quizData.questions.length})
              </button>
            ) : (
              <>
                <button
                  onClick={handleReset}
                  className="brutalist-btn brutalist-btn-primary w-full md:w-auto"
                >
                  📄 Upload New Document
                </button>
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setSubmitted(false);
                  }}
                  className="brutalist-btn w-full md:w-auto"
                  style={{ border: '3px solid var(--color-ink)' }}
                >
                  🔄 Retake Quiz
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* Card entrance animation */}
      <style>{`
        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
