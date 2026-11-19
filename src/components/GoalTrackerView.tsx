import { FormEvent, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Circle,
  Compass,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { fetchGoalAdvice, generateGoalRoadmap } from '../lib/api';
import { VISION_CATEGORIES } from '../lib/assets';
import { FutureSelfProfile, GoalItem, GoalMilestone } from '../types';

interface GoalTrackerViewProps {
  profile: FutureSelfProfile | null;
  goals: GoalItem[];
  onAddGoal: (goal: GoalItem) => void;
  onUpdateGoal: (goal: GoalItem) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalTrackerView({
  profile,
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalTrackerViewProps) {
  const [dreamTitle, setDreamTitle] = useState('');
  const [category, setCategory] = useState<string>(VISION_CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newMilestoneInputs, setNewMilestoneInputs] = useState<Record<string, string>>({});
  const [adviceLoadingId, setAdviceLoadingId] = useState<string | null>(null);

  const handleGenerateRoadmap = async (e: FormEvent) => {
    e.preventDefault();
    if (!dreamTitle.trim()) {
      setFormError('Please enter a dream or goal first.');
      return;
    }

    setFormError(null);
    setIsGenerating(true);

    try {
      const result = await generateGoalRoadmap({
        dream: dreamTitle.trim(),
        category,
        targetDate,
        profile,
      });

      const milestones: GoalMilestone[] = (result.milestones || []).map((m) => ({
        id: crypto.randomUUID(),
        title: m.title,
        tip: m.tip,
        targetDate: m.targetDate || targetDate,
        completed: false,
      }));

      const newGoal: GoalItem = {
        id: crypto.randomUUID(),
        title: dreamTitle.trim(),
        category,
        targetDate,
        milestones,
        aiAdvice: result.encouragement,
        createdAt: new Date().toISOString(),
      };

      onAddGoal(newGoal);
      setDreamTitle('');
    } catch (err) {
      setFormError((err as Error).message || 'Could not generate your roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualGoal = () => {
    if (!dreamTitle.trim()) {
      setFormError('Please enter a dream or goal first.');
      return;
    }
    setFormError(null);

    const newGoal: GoalItem = {
      id: crypto.randomUUID(),
      title: dreamTitle.trim(),
      category,
      targetDate,
      milestones: [
        {
          id: crypto.randomUUID(),
          title: 'Define first weekly action step',
          targetDate,
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    onAddGoal(newGoal);
    setDreamTitle('');
  };

  const toggleMilestone = (goal: GoalItem, milestoneId: string) => {
    const updated: GoalItem = {
      ...goal,
      milestones: goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    };
    onUpdateGoal(updated);
  };

  const addCustomMilestone = (goal: GoalItem) => {
    const text = (newMilestoneInputs[goal.id] || '').trim();
    if (!text) return;

    const updated: GoalItem = {
      ...goal,
      milestones: [
        ...goal.milestones,
        {
          id: crypto.randomUUID(),
          title: text,
          targetDate: goal.targetDate,
          completed: false,
        },
      ],
    };
    onUpdateGoal(updated);
    setNewMilestoneInputs((prev) => ({ ...prev, [goal.id]: '' }));
  };

  const deleteMilestone = (goal: GoalItem, milestoneId: string) => {
    const updated: GoalItem = {
      ...goal,
      milestones: goal.milestones.filter((m) => m.id !== milestoneId),
    };
    onUpdateGoal(updated);
  };

  const handleGetAdvice = async (goal: GoalItem) => {
    setAdviceLoadingId(goal.id);
    try {
      const done = goal.milestones.filter((m) => m.completed).length;
      const next = goal.milestones.find((m) => !m.completed)?.title;
      const advice = await fetchGoalAdvice({
        goalTitle: goal.title,
        completedCount: done,
        totalCount: goal.milestones.length,
        nextMilestone: next,
        profile,
      });
      onUpdateGoal({ ...goal, aiAdvice: advice });
    } catch (err) {
      setFormError((err as Error).message || 'Could not retrieve advice right now.');
    } finally {
      setAdviceLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
          Dream to Action
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Transform long-term ambitions into realistic, step-by-step milestones with target dates
          and practical guidance from your future self.
        </p>
      </div>

      {/* Add Goal / AI Roadmap Generator */}
      <form
        onSubmit={(e) => void handleGenerateRoadmap(e)}
        className="glass-surface-elevated rounded-3xl p-6 sm:p-8"
      >
        <h2 className="font-display text-lg font-semibold text-white">
          Create a New Goal Roadmap
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Dream or Goal
            </label>
            <input
              type="text"
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              placeholder="e.g., Become a Data Scientist"
              className="w-full rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#09091b] px-3.5 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
            >
              {VISION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#09091b]/80 px-3.5 py-2.5 text-sm text-white tabular-nums focus:border-violet-400 focus:outline-none"
            />
          </div>
        </div>

        {formError && (
          <p className="mt-3 text-xs text-rose-300" role="alert">
            {formError}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Building Roadmap...</span>
              </>
            ) : (
              <>
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>Generate AI Roadmap</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleCreateManualGoal}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create Custom Goal</span>
          </button>
        </div>
      </form>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="glass-surface rounded-2xl p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-white">
            Your action board is ready
          </h2>
          <p className="mt-2 mx-auto max-w-md text-sm text-slate-400">
            Enter any dream above—like &ldquo;Become a Data Scientist&rdquo; or &ldquo;Launch My
            First Product&rdquo;—and let your future self map out realistic milestones.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const doneCount = goal.milestones.filter((m) => m.completed).length;
            const totalCount = goal.milestones.length;
            const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
            const isCompleted = totalCount > 0 && doneCount === totalCount;

            return (
              <section key={goal.id} className="glass-surface rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="text-violet-300">{goal.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Target {goal.targetDate}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {doneCount}/{totalCount} milestones
                      </span>
                    </div>
                    <h3 className="font-display mt-1.5 text-xl font-semibold text-white sm:text-2xl">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      disabled={adviceLoadingId === goal.id}
                      onClick={() => void handleGetAdvice(goal)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3.5 py-2 text-xs font-medium text-violet-200 hover:bg-violet-500/25 disabled:opacity-50 cursor-pointer"
                    >
                      {adviceLoadingId === goal.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Compass className="h-3.5 w-3.5" />
                      )}
                      <span>Future-Self Suggestion</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`Delete goal ${goal.title}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-200 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-300">
                      {isCompleted ? 'All milestones achieved' : 'Roadmap progress'}
                    </span>
                    <span className="font-mono font-medium text-violet-300 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                          : 'bg-gradient-to-r from-violet-500 to-pink-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Achievement Card if 100% Completed */}
                {isCompleted && (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    <Award className="h-5 w-5 text-emerald-300 shrink-0" />
                    <span>
                      Achievement unlocked — you completed every milestone in &ldquo;{goal.title}
                      &rdquo;.
                    </span>
                  </div>
                )}

                {/* Future Self Note */}
                {goal.aiAdvice && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-medium text-pink-300 mb-1">
                      Note from Your Future Self
                    </p>
                    <p className="text-sm leading-relaxed text-slate-200">{goal.aiAdvice}</p>
                  </div>
                )}

                {/* Milestones List */}
                <ul className="mt-6 divide-y divide-white/10">
                  {goal.milestones.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <button
                        type="button"
                        onClick={() => toggleMilestone(goal, m.id)}
                        className="flex items-start gap-3 text-left flex-1 cursor-pointer group"
                      >
                        {m.completed ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="mt-0.5 h-5 w-5 text-slate-500 group-hover:text-violet-300 shrink-0" />
                        )}
                        <div>
                          <p
                            className={`text-sm font-medium transition-colors ${
                              m.completed ? 'text-slate-400 line-through' : 'text-slate-100'
                            }`}
                          >
                            {m.title}
                          </p>
                          {m.tip && (
                            <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                              {m.tip}
                            </p>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs text-slate-400 tabular-nums">
                          {m.targetDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteMilestone(goal, m.id)}
                          aria-label={`Remove milestone ${m.title}`}
                          className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Add Custom Milestone Inline */}
                <div className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4">
                  <input
                    type="text"
                    value={newMilestoneInputs[goal.id] || ''}
                    onChange={(e) =>
                      setNewMilestoneInputs((prev) => ({
                        ...prev,
                        [goal.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomMilestone(goal);
                      }
                    }}
                    placeholder="Add another milestone..."
                    className="flex-1 rounded-xl border border-white/15 bg-[#09091b]/70 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomMilestone(goal)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/15 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
