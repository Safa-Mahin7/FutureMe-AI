import { useState } from 'react';
import { Check, Copy, Heart, Loader2, RefreshCw } from 'lucide-react';
import { generatePersonalizedAffirmations } from '../lib/api';
import { Affirmation, FutureSelfProfile } from '../types';

interface AffirmationsViewProps {
  profile: FutureSelfProfile | null;
  affirmations: Affirmation[];
  onSetAffirmations: (items: Affirmation[]) => void;
  onToggleFavorite: (id: string) => void;
}

export function AffirmationsView({
  profile,
  affirmations,
  onSetAffirmations,
  onToggleFavorite,
}: AffirmationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [focusTopic, setFocusTopic] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleAffirmations =
    filter === 'favorites'
      ? affirmations.filter((a) => a.isFavorite)
      : affirmations;

  const spotlight =
    affirmations.find((a) => a.isFavorite) || affirmations[0] || null;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const fresh = await generatePersonalizedAffirmations({
        profile,
        focusTopic: focusTopic.trim() || undefined,
      });

      const favorites = affirmations.filter((a) => a.isFavorite);
      const created: Affirmation[] = fresh.map((item) => ({
        id: crypto.randomUUID(),
        text: item.text,
        focusArea: item.focusArea || 'Daily Focus',
        isFavorite: false,
        createdAt: new Date().toISOString(),
      }));

      // Keep saved favorites alongside freshly generated affirmations
      onSetAffirmations([...created, ...favorites.filter((fav) => !created.some((c) => c.text === fav.text))]);
    } catch (err) {
      setError((err as Error).message || 'Unable to refresh affirmations right now.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopy = async (item: Affirmation) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            Daily Affirmations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            Grounded first-person reminders crafted around your ambitions, skills, and resilience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            placeholder="Optional focus (e.g. Confidence)"
            className="rounded-xl border border-white/15 bg-[#09091b]/80 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
          />
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => void handleRefresh()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:brightness-110 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isRefreshing ? 'Generating...' : 'Refresh Affirmations'}</span>
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      {/* Spotlight Card */}
      {spotlight && (
        <section className="glass-surface-elevated rounded-3xl p-8 sm:p-10">
          <p className="text-xs font-medium text-pink-300">
            Daily Anchor · {spotlight.focusArea}
          </p>
          <blockquote className="font-display mt-3 text-2xl font-medium leading-snug text-white sm:text-3xl">
            &ldquo;{spotlight.text}&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleFavorite(spotlight.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                spotlight.isFavorite
                  ? 'border-pink-400/50 bg-pink-500/20 text-pink-200'
                  : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${spotlight.isFavorite ? 'fill-current' : ''}`}
              />
              <span>{spotlight.isFavorite ? 'Saved Favorite' : 'Save Favorite'}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleCopy(spotlight)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              {copiedId === spotlight.id ? (
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
        </section>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-violet-500/25 text-white border border-violet-400/40'
              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
          }`}
        >
          All Affirmations ({affirmations.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('favorites')}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
            filter === 'favorites'
              ? 'bg-violet-500/25 text-white border border-violet-400/40'
              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
          }`}
        >
          Favorites ({affirmations.filter((a) => a.isFavorite).length})
        </button>
      </div>

      {/* Affirmations Grid */}
      {visibleAffirmations.length === 0 ? (
        <div className="glass-surface rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-300">
            No favorite affirmations saved yet. Click the heart on any card to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleAffirmations.map((item) => (
            <article
              key={item.id}
              className="glass-surface flex flex-col justify-between rounded-2xl p-6"
            >
              <div>
                <p className="text-xs font-medium text-violet-300">{item.focusArea}</p>
                <p className="font-display mt-3 text-lg leading-relaxed text-white">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    item.isFavorite
                      ? 'text-pink-300'
                      : 'text-slate-400 hover:text-pink-200'
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${item.isFavorite ? 'fill-current' : ''}`}
                  />
                  <span>{item.isFavorite ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopy(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                >
                  {copiedId === item.id ? (
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
