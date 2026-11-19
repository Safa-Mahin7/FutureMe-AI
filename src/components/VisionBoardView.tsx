import { FormEvent, useState } from 'react';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { VISION_CATEGORIES, VISION_PRESET_IMAGES } from '../lib/assets';
import { VisionCategory, VisionItem } from '../types';

interface VisionBoardViewProps {
  visions: VisionItem[];
  onAddVision: (item: VisionItem) => void;
  onDeleteVision: (id: string) => void;
}

export function VisionBoardView({
  visions,
  onAddVision,
  onDeleteVision,
}: VisionBoardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | VisionCategory>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VisionCategory>('Career and Professional Life');
  const [description, setDescription] = useState('');
  const [targetYear, setTargetYear] = useState('2029');
  const [imageUrl, setImageUrl] = useState(VISION_PRESET_IMAGES[0].url);
  const [formError, setFormError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filtered =
    selectedCategory === 'All'
      ? visions
      : visions.filter((v) => v.category === selectedCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a dream title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please add a brief description of how this future feels.');
      return;
    }

    const newItem: VisionItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      description: description.trim(),
      targetYear: targetYear.trim() || '2030',
      imageUrl: imageUrl || VISION_PRESET_IMAGES[0].url,
      createdAt: new Date().toISOString(),
    };

    onAddVision(newItem);
    setTitle('');
    setDescription('');
    setFormError(null);
    setIsModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
            My Future Vision
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
            Collect visual anchors for the life, career, health, and experiences you are actively
            working toward.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition-all hover:brightness-110 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Dream</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-violet-500/25 text-white border border-violet-400/40'
              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          All Categories ({visions.length})
        </button>
        {VISION_CATEGORIES.map((cat) => {
          const count = visions.filter((v) => v.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-violet-500/25 text-white border border-violet-400/40'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Vision Cards Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 glass-surface rounded-2xl p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-white">
            No dreams added in this category yet
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Add a dream card with an image and target year to anchor this part of your vision.
          </p>
          <button
            type="button"
            onClick={() => {
              if (selectedCategory !== 'All') setCategory(selectedCategory);
              setIsModalOpen(true);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Dream</span>
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="glass-surface-elevated group overflow-hidden rounded-2xl flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#101028]">
                {!failedImages[item.id] ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                    }
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-950 via-indigo-950 to-fuchsia-950 p-6 text-center">
                    <span className="font-display text-sm font-medium text-violet-200">
                      {item.title}
                    </span>
                  </div>
                )}

                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09091e] via-transparent to-transparent"
                  aria-hidden="true"
                />

                <button
                  type="button"
                  onClick={() => onDeleteVision(item.id)}
                  aria-label={`Remove ${item.title}`}
                  className="absolute right-3 top-3 rounded-lg bg-black/50 p-2 text-slate-300 opacity-0 backdrop-blur-md transition-opacity hover:bg-rose-500/80 hover:text-white group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-violet-300/90">
                  <span className="truncate">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums shrink-0">{item.targetYear}</span>
                </div>

                <h2 className="font-display mt-2 text-lg font-semibold text-white">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add Dream Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-dream-title"
        >
          <div className="glass-surface-elevated max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 id="add-dream-title" className="font-display text-xl font-semibold text-white">
                Add to My Future Vision
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Dream Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Lead Machine Learning Research"
                  className="w-full rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VisionCategory)}
                    className="w-full rounded-xl border border-white/15 bg-[#09091b] px-3.5 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                  >
                    {VISION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Year
                  </label>
                  <input
                    type="text"
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    placeholder="2029"
                    className="w-full rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-2.5 text-sm text-white tabular-nums focus:border-violet-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this chapter looks and feels like..."
                  className="w-full resize-none rounded-xl border border-white/15 bg-[#09091b]/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300">
                    Choose a Visual or Upload Your Own
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 hover:text-violet-200 cursor-pointer">
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {VISION_PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`overflow-hidden rounded-xl border transition-all cursor-pointer ${
                        imageUrl === preset.url
                          ? 'border-violet-400 ring-2 ring-violet-500/40'
                          : 'border-white/10 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-xs text-rose-300" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 cursor-pointer"
                >
                  Save to Vision Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
