import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { FutureSelfProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  initialProfile: FutureSelfProfile | null;
  onClose: () => void;
  onComplete: (profile: FutureSelfProfile) => void;
}

interface QuestionDef {
  key: keyof Omit<FutureSelfProfile, 'updatedAt'>;
  question: string;
  helper: string;
  placeholder: string;
  inputType: 'text' | 'number' | 'textarea' | 'personality';
  optional: boolean;
}

const QUESTIONS: QuestionDef[] = [
  {
    key: 'name',
    question: 'What should we call you?',
    helper: 'Your future self will address you warmly by this name.',
    placeholder: 'e.g., Alex, Maya, Jordan',
    inputType: 'text',
    optional: false,
  },
  {
    key: 'age',
    question: 'What is your current age?',
    helper: 'Optional — helps frame the timeline between today and your future self.',
    placeholder: 'e.g., 22',
    inputType: 'number',
    optional: true,
  },
  {
    key: 'currentRole',
    question: 'What are you currently studying or doing?',
    helper: 'Optional — share your school, job, or current chapter.',
    placeholder: 'e.g., Computer Science student working part-time, or Junior Designer',
    inputType: 'text',
    optional: true,
  },
  {
    key: 'careerAmbition',
    question: 'What is your biggest career ambition?',
    helper: 'Optional — what kind of work or impact do you want to grow into?',
    placeholder: 'e.g., Becoming a Data Scientist building meaningful climate tools',
    inputType: 'textarea',
    optional: true,
  },
  {
    key: 'fiveYearVision',
    question: 'Where do you imagine yourself in 5 years?',
    helper: 'Optional — paint a picture of the chapter you are working toward.',
    placeholder: 'e.g., Living independently in a sunlit apartment, leading impactful projects...',
    inputType: 'textarea',
    optional: true,
  },
  {
    key: 'personalDreams',
    question: 'What are your personal dreams?',
    helper: 'Optional — creative pursuits, relationships, travel, or personal milestones.',
    placeholder: 'e.g., Publishing a book, running a half-marathon, visiting Japan with family',
    inputType: 'textarea',
    optional: true,
  },
  {
    key: 'currentChallenges',
    question: 'What challenges are you currently facing?',
    helper: 'Optional — naming what feels heavy helps your future self meet you with empathy.',
    placeholder: 'e.g., Imposter syndrome, staying consistent after work, balancing deadlines',
    inputType: 'textarea',
    optional: true,
  },
  {
    key: 'skillsToDevelop',
    question: 'What skills do you want to develop?',
    helper: 'Optional — technical abilities, creative craft, or personal habits.',
    placeholder: 'e.g., Python, Machine Learning, public speaking, calm time management',
    inputType: 'text',
    optional: true,
  },
  {
    key: 'idealLifestyle',
    question: 'Describe your ideal future lifestyle.',
    helper: 'Optional — how do your mornings, workdays, and weekends feel?',
    placeholder: 'e.g., Peaceful mornings with coffee, focused creative work, evenings free for friends',
    inputType: 'textarea',
    optional: true,
  },
  {
    key: 'personalityStyle',
    question: 'What kind of future-self personality would motivate you?',
    helper: 'Optional — choose a tone or write your own.',
    placeholder: 'e.g., Warm, calm, grounded, and practically encouraging',
    inputType: 'personality',
    optional: true,
  },
];

const PERSONALITY_PRESETS = [
  {
    label: 'Warm & Gentle Mentor',
    description: 'Compassionate, reassuring, emotionally attentive, and patient.',
  },
  {
    label: 'Calm & Practical Strategist',
    description: 'Clear-headed, structured, grounded in realistic daily next steps.',
  },
  {
    label: 'Bold & Encouraging Coach',
    description: 'Energetic, confident, uplifting, and action-oriented without pressure.',
  },
  {
    label: 'Wise & Reflective Guide',
    description: 'Thoughtful, philosophical, attentive to long-term meaning and peace.',
  },
];

const EMPTY_FORM: Omit<FutureSelfProfile, 'updatedAt'> = {
  name: '',
  age: '',
  currentRole: '',
  careerAmbition: '',
  fiveYearVision: '',
  personalDreams: '',
  currentChallenges: '',
  skillsToDevelop: '',
  idealLifestyle: '',
  personalityStyle: 'Warm & Gentle Mentor — compassionate, reassuring, and practically encouraging.',
};

export function OnboardingModal({
  isOpen,
  initialProfile,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Omit<FutureSelfProfile, 'updatedAt'>>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setError(null);
      if (initialProfile) {
        const { updatedAt: _u, ...rest } = initialProfile;
        setForm({ ...EMPTY_FORM, ...rest });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  const currentQ = QUESTIONS[step];
  const progressPercent = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const validateCurrentStep = (): boolean => {
    setError(null);
    if (currentQ.key === 'age' && form.age.trim()) {
      const n = Number(form.age);
      if (!Number.isFinite(n) || n < 10 || n > 110) {
        setError('Please enter a valid age between 10 and 110, or click Skip.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    setError(null);
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    const finalProfile: FutureSelfProfile = {
      ...form,
      name: form.name.trim() || 'Friend',
      updatedAt: new Date().toISOString(),
    };
    onComplete(finalProfile);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-heading"
    >
      <div className="glass-surface-elevated relative w-full max-w-2xl rounded-3xl p-6 sm:p-9 shadow-2xl">
        {/* Top Row: Step Progress & Close */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="font-mono tabular-nums text-violet-300">
              Step {step + 1} of {QUESTIONS.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentQ.optional ? 'Optional' : 'Personalization'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close onboarding"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="mt-8">
          <h2 id="onboarding-heading" className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {currentQ.question}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{currentQ.helper}</p>

          <div className="mt-6">
            {currentQ.inputType === 'text' && (
              <input
                type="text"
                autoFocus
                value={form[currentQ.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [currentQ.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNext();
                  }
                }}
                placeholder={currentQ.placeholder}
                className="w-full rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            )}

            {currentQ.inputType === 'number' && (
              <input
                type="number"
                min={10}
                max={110}
                autoFocus
                value={form[currentQ.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [currentQ.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNext();
                  }
                }}
                placeholder={currentQ.placeholder}
                className="w-full rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-3.5 text-sm text-white placeholder-slate-500 tabular-nums focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            )}

            {currentQ.inputType === 'textarea' && (
              <textarea
                rows={4}
                autoFocus
                value={form[currentQ.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [currentQ.key]: e.target.value }))}
                placeholder={currentQ.placeholder}
                className="w-full resize-none rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-3.5 text-sm leading-relaxed text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            )}

            {currentQ.inputType === 'personality' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {PERSONALITY_PRESETS.map((preset) => {
                    const valueStr = `${preset.label} — ${preset.description}`;
                    const selected = form.personalityStyle.startsWith(preset.label);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, personalityStyle: valueStr }))
                        }
                        className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          selected
                            ? 'border-violet-400 bg-violet-500/20 text-white'
                            : 'border-white/10 bg-[#09091b]/70 text-slate-300 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{preset.label}</span>
                          {selected && <Check className="h-4 w-4 text-violet-300 shrink-0" />}
                        </div>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={form.personalityStyle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, personalityStyle: e.target.value }))
                  }
                  placeholder={currentQ.placeholder}
                  className="w-full rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>
            )}

            {error && (
              <p className="mt-2.5 text-xs text-rose-300" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => {
              setError(null);
              setStep((s) => Math.max(0, s - 1));
            }}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200 cursor-pointer"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>
                {step === QUESTIONS.length - 1 ? 'Meet My Future Self' : 'Continue'}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
