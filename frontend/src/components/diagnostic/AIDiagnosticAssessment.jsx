import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Send, FileText } from 'lucide-react';

const FRAC_LABELS = {
  comp_statistical: { label: 'Statistical', color: '#3B82F6', icon: '📊' },
  comp_technical: { label: 'Technical', color: '#8B5CF6', icon: '💻' },
  comp_digital_governance: { label: 'Digital Governance', color: '#10B981', icon: '🏛️' },
  comp_behavioural: { label: 'Behavioural', color: '#F59E0B', icon: '🤝' },
};

/**
 * Fisher-Yates shuffle — returns a new shuffled array
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * AIDiagnosticAssessment
 * 
 * Renders the AI-generated quiz section by section.
 * No feedback shown during quiz — user just selects and moves on.
 * Descriptive questions have a word counter (50-100 words).
 */
export default function AIDiagnosticAssessment({ sections, onSubmit }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0); // 0-3 = MCQ, 4 = descriptive
  const [mcqAnswers, setMcqAnswers] = useState({}); // { quadrant: [ans0, ans1, ans2, ans3] }
  const [descriptiveAnswers, setDescriptiveAnswers] = useState({}); // { quadrant: text }

  // Shuffle options once per quiz render
  const shuffledOptions = useMemo(() => {
    const map = {};
    sections.forEach((section) => {
      section.mcqs.forEach((mcq, i) => {
        const key = `${section.frac_quadrant}_${i}`;
        map[key] = shuffle(mcq.options);
      });
    });
    return map;
  }, [sections]);

  const section = sections[currentSection];
  const quadrant = section.frac_quadrant;
  const fracMeta = FRAC_LABELS[quadrant] || { label: quadrant, color: '#666', icon: '📝' };
  const isDescriptive = currentQuestion === 4;
  const totalQuestionsPerSection = 5; // 4 MCQ + 1 descriptive
  const globalQuestion = currentSection * totalQuestionsPerSection + currentQuestion + 1;
  const totalQuestions = sections.length * totalQuestionsPerSection;

  // Current MCQ data
  const mcq = !isDescriptive ? section.mcqs[currentQuestion] : null;
  const optionsKey = `${quadrant}_${currentQuestion}`;
  const options = mcq ? (shuffledOptions[optionsKey] || mcq.options) : [];

  // Get current answer
  const currentMcqAnswer = mcqAnswers[quadrant]?.[currentQuestion];
  const currentDescAnswer = descriptiveAnswers[quadrant] || '';

  // Word count for descriptive
  const wordCount = currentDescAnswer.trim().split(/\s+/).filter(Boolean).length;

  // Check if all questions are answered
  const allAnswered = useMemo(() => {
    for (const sec of sections) {
      const q = sec.frac_quadrant;
      const mcqAns = mcqAnswers[q] || [];
      for (let i = 0; i < 4; i++) {
        if (!mcqAns[i]) return false;
      }
      const desc = descriptiveAnswers[q] || '';
      if (desc.trim().split(/\s+/).filter(Boolean).length < 10) return false; // min 10 words
    }
    return true;
  }, [mcqAnswers, descriptiveAnswers, sections]);

  const handleSelectOption = (option) => {
    setMcqAnswers((prev) => {
      const arr = [...(prev[quadrant] || [null, null, null, null])];
      arr[currentQuestion] = option;
      return { ...prev, [quadrant]: arr };
    });
  };

  const handleDescriptiveChange = (text) => {
    setDescriptiveAnswers((prev) => ({ ...prev, [quadrant]: text }));
  };

  const goNext = () => {
    if (currentQuestion < 4) {
      setCurrentQuestion((p) => p + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection((p) => p + 1);
      setCurrentQuestion(0);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((p) => p - 1);
    } else if (currentSection > 0) {
      setCurrentSection((p) => p - 1);
      setCurrentQuestion(4);
    }
  };

  const handleSubmit = () => {
    // Build answers payload
    const payload = {};
    sections.forEach((sec) => {
      const q = sec.frac_quadrant;
      payload[q] = {
        mcq_answers: mcqAnswers[q] || [],
        descriptive_answer: descriptiveAnswers[q] || '',
      };
    });
    onSubmit(payload);
  };

  const isLast = currentSection === sections.length - 1 && currentQuestion === 4;
  const isFirst = currentSection === 0 && currentQuestion === 0;

  // Progress bar
  const progress = (globalQuestion / totalQuestions) * 100;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="label-mono text-sm">
            Question {globalQuestion} of {totalQuestions}
          </span>
          <span
            className="label-mono px-3 py-1 text-xs"
            style={{ background: fracMeta.color, color: '#fff' }}
          >
            {fracMeta.icon} {fracMeta.label} — {isDescriptive ? 'Descriptive (5 marks)' : `MCQ ${currentQuestion + 1}/4 (1 mark)`}
          </span>
        </div>
        <div
          className="w-full h-3 bg-canvas overflow-hidden"
          style={{
            border: 'var(--border-width) solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
          }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${fracMeta.color}, ${fracMeta.color}dd)`,
              borderRadius: 'var(--border-radius)',
            }}
          />
        </div>
      </div>

      {/* Section indicator */}
      <div className="flex gap-2 mb-6">
        {sections.map((sec, i) => (
          <div
            key={sec.frac_quadrant}
            className="flex-1 h-2"
            style={{
              background: i < currentSection ? FRAC_LABELS[sec.frac_quadrant]?.color : 
                          i === currentSection ? `${FRAC_LABELS[sec.frac_quadrant]?.color}80` : 'var(--color-border)',
              borderRadius: 4,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Question Card */}
      <div
        className="brutalist-card p-6 md:p-8 bg-surface"
        style={{ animation: 'cardSlideIn 0.3s ease-out' }}
      >
        {/* MCQ Question */}
        {!isDescriptive && mcq && (
          <>
            <div className="mb-2 label-mono text-xs text-muted">
              iGOT Topic: {mcq.igot_topic}
            </div>
            <h3 className="heading-md mb-6" style={{ lineHeight: 1.5 }}>
              {mcq.question_text}
            </h3>
            <div className="space-y-3">
              {options.map((option, idx) => {
                const isSelected = currentMcqAnswer === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left p-4 transition-all duration-150"
                    style={{
                      border: `2px solid ${isSelected ? fracMeta.color : 'var(--color-border)'}`,
                      borderRadius: 'var(--border-radius)',
                      background: isSelected ? `${fracMeta.color}15` : 'var(--color-canvas)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span
                      className="label-mono text-xs mr-3 px-2 py-1 inline-block"
                      style={{
                        background: isSelected ? fracMeta.color : '#e5e7eb',
                        color: isSelected ? '#fff' : '#111',
                        minWidth: 24,
                        textAlign: 'center',
                        borderRadius: 4,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Descriptive Question */}
        {isDescriptive && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} style={{ color: fracMeta.color }} />
              <span className="label-mono text-xs text-muted">
                iGOT Topic: {section.descriptive.igot_topic} — Descriptive (5 marks)
              </span>
            </div>
            <h3 className="heading-md mb-6" style={{ lineHeight: 1.5 }}>
              {section.descriptive.question_text}
            </h3>
            <textarea
              value={currentDescAnswer}
              onChange={(e) => handleDescriptiveChange(e.target.value)}
              placeholder="Write your answer in 50-100 words..."
              rows={6}
              className="w-full p-4 text-sm"
              style={{
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
                background: 'var(--color-canvas)',
                fontFamily: 'var(--font-body)',
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <span
                className="label-mono text-xs"
                style={{
                  color: wordCount < 50 ? '#DC2626' : wordCount > 100 ? '#F59E0B' : 'var(--color-emerald)',
                }}
              >
                {wordCount} / 100 words
                {wordCount < 50 && ' (minimum 50)'}
                {wordCount > 100 && ' (try to keep under 100)'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="brutalist-btn px-5 py-2.5 flex items-center gap-2"
          style={{
            opacity: isFirst ? 0.4 : 1,
            background: 'var(--color-surface)',
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="brutalist-btn px-6 py-2.5 flex items-center gap-2"
            style={{
              background: allAnswered ? 'var(--color-primary)' : 'var(--color-border)',
              color: allAnswered ? '#fff' : 'var(--color-muted)',
              cursor: allAnswered ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={16} /> Submit Assessment
          </button>
        ) : (
          <button
            onClick={goNext}
            className="brutalist-btn px-5 py-2.5 flex items-center gap-2"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
