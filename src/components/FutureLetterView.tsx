import { useState } from 'react';
import { Bookmark, Check, Copy, Download, Loader2, Mail, Trash2 } from 'lucide-react';
import { generateFutureLetter } from '../lib/api';
import { FutureLetter, FutureSelfProfile, LetterHorizon } from '../types';

interface FutureLetterViewProps {
  profile: FutureSelfProfile | null;
  letters: FutureLetter[];
  onSaveLetter: (letter: FutureLetter) => void;
  onDeleteLetter: (id: string) => void;
}

const HORIZONS: Array<{ value: LetterHorizon; label: string }> = [
  { value: '1 year', label: '1 year from now' },
  { value: '3 years', label: '3 years from now' },
  { value: '5 years', label: '5 years from now' },
  { value: '10 years', label: '10 years from now' },
];

export function FutureLetterView({
  profile,
  letters,
  onSaveLetter,
  onDeleteLetter,
}: FutureLetterViewProps) {
  const [horizon, setHorizon] = useState<LetterHorizon>('5 years');
  const [focusNote, setFocusNote] = useState('');
  const [activeLetter, setActiveLetter] = useState<FutureLetter | null>(letters[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isSaved = activeLetter
    ? letters.some((l) => l.id === activeLetter.id)
    : false;

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateFutureLetter({
        horizon,
        focusNote,
        profile,
      });

      const generated: FutureLetter = {
        id: crypto.randomUUID(),
        horizon,
        title: result.title || `A Note from ${horizon} Ahead`,
        content: result.content,
        focusNote: focusNote.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      setActiveLetter(generated);
      onSaveLetter(generated);
    } catch (err) {
      setError((err as Error).message || 'Could not generate your letter right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!activeLetter) return;
    try {
      await navigator.clipboard.writeText(`${activeLetter.title}\n\n${activeLetter.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownload = () => {
    if (!activeLetter) return;
    const textBody = `${activeLetter.title}\nWritten from ${activeLetter.horizon} ahead · ${new Date(
      activeLetter.createdAt
    ).toLocaleDateString()}\n\n${activeLetter.content}\n`;
    const blob = new Blob([textBody], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `future-letter-${activeLetter.horizon.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
          A Letter From Your Future Self
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Choose how far ahead you want to look, and receive a grounded, deeply personal letter
          written from your envisioned future self.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Controls & Saved Library */}
        <div className="space-y-6 lg:col-span-5">
          <section className="glass-surface-elevated rounded-2xl p-6">
            <h2 className="font-display text-base font-semibold text-white">
              Choose Timeline
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {HORIZONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHorizon(opt.value)}
                  className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                    horizon === opt.value
                      ? 'border-violet-400 bg-violet-500/25 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <label
                htmlFor="letter-focus-note"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                What is on your heart today? (Optional)
              </label>
              <textarea
                id="letter-focus-note"
                rows={3}
                value={focusNote}
                onChange={(e) => setFocusNote(e.target.value)}
                placeholder="e.g., Feeling uncertain about switching careers, or preparing for final exams..."
                className="w-full resize-none rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
              />
            </div>

            {error && (
              <p className="mt-3 text-xs text-rose-300" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => void handleGenerate()}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Writing your letter...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Generate Letter</span>
                </>
              )}
            </button>
          </section>

          {/* Saved Letters List */}
          <section className="glass-surface rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-white">
                Saved Letters
              </h2>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {letters.length}
              </span>
            </div>

            {letters.length === 0 ? (
              <p className="mt-4 text-xs leading-relaxed text-slate-400">
                Your generated letters are automatically saved here so you can revisit them anytime.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {letters.map((item) => {
                  const selected = activeLetter?.id === item.id;
                  return (
                    <li
                      key={item.id}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 transition-colors ${
                        selected
                          ? 'border-violet-400/45 bg-violet-500/15'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveLetter(item)}
                        className="min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <p className="truncate text-sm font-medium text-white">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {item.horizon} ahead ·{' '}
                          <span className="font-mono tabular-nums">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteLetter(item.id);
                          if (activeLetter?.id === item.id) {
                            const next = letters.find((l) => l.id !== item.id) || null;
                            setActiveLetter(next);
                          }
                        }}
                        aria-label={`Delete letter ${item.title}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right Letter Canvas */}
        <div className="lg:col-span-7">
          {activeLetter ? (
            <article className="glass-surface-elevated rounded-3xl p-7 sm:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-medium text-pink-300">
                    {activeLetter.horizon} from now ·{' '}
                    <span className="font-mono tabular-nums">
                      {new Date(activeLetter.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <h2 className="font-display mt-1.5 text-2xl font-semibold text-white">
                    {activeLetter.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isSaved && (
                    <button
                      type="button"
                      onClick={() => onSaveLetter(activeLetter)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-base leading-[1.75] text-slate-200 whitespace-pre-wrap">
                {activeLetter.content}
              </div>
            </article>
          ) : (
            <div className="glass-surface flex min-h-[420px] flex-col items-center justify-center rounded-3xl p-10 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 border border-violet-400/20">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="font-display mt-4 text-xl font-semibold text-white">
                Receive your first letter across time
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                Select a future horizon on the left and click Generate Letter. Your future self will
                reflect on where you are today and remind you why each small step matters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
