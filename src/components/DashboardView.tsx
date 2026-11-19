import { ArrowRight, Check, Copy, Edit3, Mail, MessageCircle, Target } from 'lucide-react';
import { useState } from 'react';
import {
  Affirmation,
  AppView,
  ChatThread,
  FutureLetter,
  FutureSelfProfile,
  GoalItem,
} from '../types';

interface DashboardViewProps {
  profile: FutureSelfProfile | null;
  threads: ChatThread[];
  letters: FutureLetter[];
  affirmations: Affirmation[];
  goals: GoalItem[];
  onNavigate: (view: AppView) => void;
  onOpenThread: (threadId: string) => void;
  onEditProfile: () => void;
}

export function DashboardView({
  profile,
  threads,
  letters,
  affirmations,
  goals,
  onNavigate,
  onOpenThread,
  onEditProfile,
}: DashboardViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const userName = profile?.name?.trim() || 'Friend';
  const totalMilestones = goals.reduce((acc, g) => acc + g.milestones.length, 0);
  const completedMilestones = goals.reduce(
    (acc, g) => acc + g.milestones.filter((m) => m.completed).length,
    0
  );
  const overallProgress =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const dailyAffirmation =
    affirmations.find((a) => a.isFavorite) || affirmations[0] || null;

  const handleCopyAffirmation = async (aff: Affirmation) => {
    try {
      await navigator.clipboard.writeText(aff.text);
      setCopiedId(aff.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10 space-y-8">
      {/* Welcome & Profile Banner */}
      <div className="glass-surface-elevated rounded-3xl p-7 sm:p-9">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-medium text-violet-300">
              Personal Space · FutureMe AI
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Welcome back, {userName}.
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-300">
              {profile?.fiveYearVision
                ? `Your 5-year horizon: ${profile.fiveYearVision}`
                : 'Shape your personal profile, converse with your future self, and turn ambitions into steady milestones.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:brightness-110 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Talk to Future Self</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Active Goals</p>
            <p className="font-display mt-1 text-2xl font-semibold text-white tabular-nums">
              {goals.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Completed Milestones</p>
            <p className="font-display mt-1 text-2xl font-semibold text-white tabular-nums">
              {completedMilestones}
              <span className="text-sm font-normal text-slate-400"> / {totalMilestones}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Overall Progress</p>
            <p className="font-display mt-1 text-2xl font-semibold text-violet-300 tabular-nums">
              {overallProgress}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Saved Future Letters</p>
            <p className="font-display mt-1 text-2xl font-semibold text-white tabular-nums">
              {letters.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Future Self Profile + Daily Affirmation */}
        <div className="space-y-6 lg:col-span-5">
          {/* Future Self Profile Card */}
          <section className="glass-surface rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                Future Self Profile
              </h2>
              <button
                type="button"
                onClick={onEditProfile}
                className="text-xs font-medium text-violet-300 hover:text-violet-200 cursor-pointer"
              >
                Update
              </button>
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Main Ambition</dt>
                <dd className="mt-1 font-medium text-slate-100">
                  {profile?.careerAmbition || 'Not specified yet — add your main ambition'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Current Focus</dt>
                <dd className="mt-1 text-slate-300">
                  {profile?.currentRole || 'Share what you are studying or working on'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Skills Developing</dt>
                <dd className="mt-1 text-slate-300">
                  {profile?.skillsToDevelop || 'Add skills you want to build'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Mentor Personality</dt>
                <dd className="mt-1 text-slate-300">
                  {profile?.personalityStyle || 'Warm & Gentle Mentor'}
                </dd>
              </div>
            </dl>
          </section>

          {/* Daily Affirmation Spotlight */}
          <section className="glass-surface-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                Today&apos;s Affirmation
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('affirmations')}
                className="text-xs font-medium text-violet-300 hover:text-violet-200 cursor-pointer"
              >
                View All
              </button>
            </div>

            {dailyAffirmation ? (
              <div className="mt-4">
                <p className="text-xs text-pink-300">{dailyAffirmation.focusArea}</p>
                <p className="font-display mt-2 text-lg leading-relaxed text-white">
                  &ldquo;{dailyAffirmation.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleCopyAffirmation(dailyAffirmation)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
                  >
                    {copiedId === dailyAffirmation.id ? (
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
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Visit Daily Affirmations to generate personalized statements for your goals.
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Active Goals + Recent Conversations + Saved Letters */}
        <div className="space-y-6 lg:col-span-7">
          {/* Active Goals */}
          <section className="glass-surface rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                Dream to Action Progress
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('goals')}
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200 cursor-pointer"
              >
                <span>Open Tracker</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-white/15 p-6 text-center">
                <Target className="mx-auto h-6 w-6 text-violet-300/80" />
                <p className="mt-2 text-sm text-slate-300">
                  No active action roadmaps yet.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('goals')}
                  className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
                >
                  Create Your First Roadmap
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {goals.slice(0, 3).map((goal) => {
                  const done = goal.milestones.filter((m) => m.completed).length;
                  const total = goal.milestones.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div
                      key={goal.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {goal.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {goal.category} · Target {goal.targetDate}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-medium text-violet-300 tabular-nums shrink-0">
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Conversations & Saved Letters */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className="glass-surface rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-white">
                  Recent Conversations
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('chat')}
                  className="text-xs font-medium text-violet-300 hover:text-violet-200 cursor-pointer"
                >
                  Open Chat
                </button>
              </div>

              {threads.length === 0 ? (
                <p className="mt-4 text-xs text-slate-400">
                  Start your first dialogue with Future {userName}.
                </p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {threads.slice(0, 3).map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => onOpenThread(t.id)}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left transition-colors hover:border-violet-400/35 hover:bg-white/[0.06] cursor-pointer"
                      >
                        <p className="truncate text-xs font-medium text-slate-100">{t.title}</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">
                          {t.messages.length} messages
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-surface rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-white">
                  Saved Future Letters
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('letter')}
                  className="text-xs font-medium text-violet-300 hover:text-violet-200 cursor-pointer"
                >
                  Write Letter
                </button>
              </div>

              {letters.length === 0 ? (
                <div className="mt-4">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <p className="mt-2 text-xs text-slate-400">
                    Generate a letter from 1, 3, 5, or 10 years ahead.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {letters.slice(0, 3).map((letter) => (
                    <li key={letter.id}>
                      <button
                        type="button"
                        onClick={() => onNavigate('letter')}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left transition-colors hover:border-pink-400/35 hover:bg-white/[0.06] cursor-pointer"
                      >
                        <p className="truncate text-xs font-medium text-slate-100">
                          {letter.title}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {letter.horizon} from now
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
