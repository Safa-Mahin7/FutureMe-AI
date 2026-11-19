import { motion } from 'motion/react';
import { ArrowRight, Compass, MessageCircle, Target } from 'lucide-react';
import { HERO_ARTWORK } from '../lib/assets';
import { AppView, FutureSelfProfile } from '../types';

interface LandingPageProps {
  profile: FutureSelfProfile | null;
  onStartOnboarding: () => void;
  onNavigateView: (view: AppView) => void;
}

export function LandingPage({
  profile,
  onStartOnboarding,
  onNavigateView,
}: LandingPageProps) {
  const hasProfile = Boolean(profile?.name || profile?.careerAmbition || profile?.fiveYearVision);

  const handlePrimaryAction = () => {
    if (hasProfile) {
      onNavigateView('chat');
    } else {
      onStartOnboarding();
    }
  };

  const handleFeatureSelect = (view: AppView) => {
    if (hasProfile) {
      onNavigateView(view);
    } else {
      onStartOnboarding();
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#060612]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
          >
            FutureMe AI
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <button
              type="button"
              onClick={() => handleFeatureSelect('vision')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Vision Board
            </button>
            <button
              type="button"
              onClick={() => handleFeatureSelect('letter')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Future Letters
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <span>{hasProfile ? 'Open Chat' : 'Meet Your Future Self'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-center lg:col-span-6"
            >
              <p className="text-sm font-medium text-violet-300/90 mb-4">
                Meet the person you&apos;re becoming.
              </p>

              <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                Your Future Self Is Waiting.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                What if you could have a conversation with the person you&apos;re working so hard to
                become?
              </p>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
                Share where you are today, the dreams you&apos;re building toward, and the obstacles in
                your way. FutureMe AI simulates thoughtful dialogues with your envisioned future self
                and turns your vision into practical daily steps.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onStartOnboarding}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-900/40 transition-all hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <span>{hasProfile ? 'Update My Future Vision' : 'Meet Your Future Self'}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                {hasProfile && (
                  <button
                    type="button"
                    onClick={() => onNavigateView('dashboard')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    Go to Dashboard
                  </button>
                )}
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Motivational visualization experience · Grounded in your personal goals, never a
                prediction of the actual future.
              </p>
            </motion.div>

            {/* Animated Futuristic Visual Representing Present Self Meeting Future Self */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex items-center"
            >
              <div className="relative w-full overflow-hidden rounded-3xl border border-violet-300/20 bg-[#101028]/80 shadow-2xl shadow-violet-950/60">
                {/* Ambient orbital halo rings */}
                <div
                  className="pointer-events-none absolute -inset-12 opacity-40 blur-3xl"
                  style={{
                    background:
                      'radial-gradient(circle at 65% 45%, rgba(236, 72, 153, 0.25), transparent 55%), radial-gradient(circle at 30% 55%, rgba(124, 58, 237, 0.35), transparent 60%)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={HERO_ARTWORK}
                    alt="Present self standing across a reflective starry horizon facing their luminous future self"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover animate-gentle-float"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#060612] via-[#060612]/25 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Subtle interactive temporal dialogue preview caption */}
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <div className="glass-surface rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between text-xs text-violet-200/80 mb-2">
                        <span>5 Years Ahead</span>
                        <span aria-hidden="true">·</span>
                        <span>Reflective Dialogue</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-100">
                        &ldquo;I remember how uncertain this chapter felt. Every quiet hour you put in
                        today is part of how we got here.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-t border-white/10 bg-[#080818]/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                How the platform works
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-300">
                A structured space that connects emotional clarity with realistic daily momentum.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="glass-surface rounded-2xl p-7">
                <span className="font-mono text-xs font-medium text-violet-300 tabular-nums">
                  01. Personalize
                </span>
                <h3 className="font-display mt-3 text-xl font-semibold text-white">
                  Define Your Horizon
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  Walk through a gentle 10-step reflection covering your ambitions, current
                  challenges, desired skills, and the future personality that motivates you most.
                </p>
              </div>

              <div className="glass-surface rounded-2xl p-7">
                <span className="font-mono text-xs font-medium text-fuchsia-300 tabular-nums">
                  02. Converse
                </span>
                <h3 className="font-display mt-3 text-xl font-semibold text-white">
                  Dialogue Across Time
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  Talk openly about doubts, breakthroughs, and daily decisions. Your AI future self
                  responds in first person using your real goals and context.
                </p>
              </div>

              <div className="glass-surface rounded-2xl p-7">
                <span className="font-mono text-xs font-medium text-indigo-300 tabular-nums">
                  03. Build
                </span>
                <h3 className="font-display mt-3 text-xl font-semibold text-white">
                  Commit to Action
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  Translate long-term dreams into concrete milestones, daily affirmations, visual
                  anchors, and letters from 1 to 10 years ahead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Three Feature Cards Section */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for clarity, reflection, and steady action
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-300">
              Every workspace module keeps your vision grounded in what you can shape today.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Feature Card 1 */}
            <div className="glass-surface-elevated flex flex-col justify-between rounded-2xl p-7 transition-transform duration-200 hover:-translate-y-1">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 border border-violet-400/20">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold text-white">
                  Talk to Your Future Self.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Have deep, contextual conversations with your envisioned future self. Ask for
                  perspective when stuck, celebrate progress, and explore realistic next steps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFeatureSelect('chat')}
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors cursor-pointer w-fit"
              >
                <span>Open Future Chat</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Feature Card 2 */}
            <div className="glass-surface-elevated flex flex-col justify-between rounded-2xl p-7 transition-transform duration-200 hover:-translate-y-1">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/15 text-pink-300 border border-pink-400/20">
                  <Compass className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold text-white">
                  Visualize Your Dreams.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Curate a personal Future Vision board across career, wellness, finances, and
                  travel—paired with custom letters written from 1, 3, 5, or 10 years ahead.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFeatureSelect('vision')}
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-pink-300 hover:text-pink-200 transition-colors cursor-pointer w-fit"
              >
                <span>Explore Vision Board</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Feature Card 3 */}
            <div className="glass-surface-elevated flex flex-col justify-between rounded-2xl p-7 transition-transform duration-200 hover:-translate-y-1">
              <div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
                  <Target className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display mt-5 text-xl font-semibold text-white">
                  Turn Dreams Into Reality.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Convert ambitious goals into step-by-step AI roadmaps, track target dates and
                  milestones, and stay grounded with personalized daily affirmations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFeatureSelect('goals')}
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer w-fit"
              >
                <span>Open Goal Tracker</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* Emotional Closing Callout */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="glass-surface-elevated rounded-3xl px-8 py-12 text-center sm:px-14">
            <h2 className="font-display mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Every version of your future begins with one honest conversation today.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
              Take three minutes to share your dreams and start talking with the future self you are
              choosing to build.
            </p>
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:brightness-110 active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{hasProfile ? 'Continue to Your Workspace' : 'Meet Your Future Self'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 bg-[#050510]/80 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-base font-semibold text-white">FutureMe AI</p>
            <p className="mt-1 text-xs text-slate-400">
              Meet the person you&apos;re becoming. Motivational visualization companion, not a
              prediction of the actual future.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => handleFeatureSelect('chat')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Future Chat
            </button>
            <button
              type="button"
              onClick={() => handleFeatureSelect('vision')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Vision Board
            </button>
            <button
              type="button"
              onClick={() => handleFeatureSelect('letter')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Future Letters
            </button>
            <button
              type="button"
              onClick={() => handleFeatureSelect('goals')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Dream to Action
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
