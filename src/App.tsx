import { useEffect, useState } from 'react';
import {
  Compass,
  Heart,
  LayoutDashboard,
  Mail,
  Menu,
  MessageCircle,
  Target,
  UserCheck,
  X,
} from 'lucide-react';
import { AffirmationsView } from './components/AffirmationsView';
import { DashboardView } from './components/DashboardView';
import { FutureChatView } from './components/FutureChatView';
import { FutureLetterView } from './components/FutureLetterView';
import { GoalTrackerView } from './components/GoalTrackerView';
import { LandingPage } from './components/LandingPage';
import { OnboardingModal } from './components/OnboardingModal';
import { StarfieldBackground } from './components/StarfieldBackground';
import { VisionBoardView } from './components/VisionBoardView';
import {
  loadActiveThreadId,
  loadAffirmations,
  loadGoals,
  loadLetters,
  loadProfile,
  loadThreads,
  loadVisions,
  saveActiveThreadId,
  saveAffirmations,
  saveGoals,
  saveLetters,
  saveProfile,
  saveThreads,
  saveVisions,
} from './lib/storage';
import {
  Affirmation,
  AppView,
  ChatMessage,
  ChatThread,
  FutureLetter,
  FutureSelfProfile,
  GoalItem,
  VisionItem,
} from './types';

interface NavItem {
  id: AppView;
  label: string;
  icon: typeof MessageCircle;
}

const WORKSPACE_NAV: NavItem[] = [
  { id: 'chat', label: 'Future Self Chat', icon: MessageCircle },
  { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { id: 'vision', label: 'My Future Vision', icon: Compass },
  { id: 'letter', label: 'Future Letter', icon: Mail },
  { id: 'affirmations', label: 'Daily Affirmations', icon: Heart },
  { id: 'goals', label: 'Dream to Action', icon: Target },
];

export default function App() {
  const [profile, setProfile] = useState<FutureSelfProfile | null>(() => loadProfile());
  const [threads, setThreads] = useState<ChatThread[]>(() => loadThreads());
  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => loadActiveThreadId());
  const [visions, setVisions] = useState<VisionItem[]>(() => loadVisions());
  const [letters, setLetters] = useState<FutureLetter[]>(() => loadLetters());
  const [affirmations, setAffirmations] = useState<Affirmation[]>(() => loadAffirmations());
  const [goals, setGoals] = useState<GoalItem[]>(() => loadGoals());

  const [view, setView] = useState<AppView>('landing');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Persist changes to localStorage
  useEffect(() => {
    if (profile) saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  useEffect(() => {
    saveActiveThreadId(activeThreadId);
  }, [activeThreadId]);

  useEffect(() => {
    saveVisions(visions);
  }, [visions]);

  useEffect(() => {
    saveLetters(letters);
  }, [letters]);

  useEffect(() => {
    saveAffirmations(affirmations);
  }, [affirmations]);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const handleCompleteOnboarding = (newProfile: FutureSelfProfile) => {
    setProfile(newProfile);
    setIsOnboardingOpen(false);
    if (threads.length === 0) {
      const id = crypto.randomUUID();
      const starterThread: ChatThread = {
        id,
        title: `First Dialogue with Future ${newProfile.name}`,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      setThreads([starterThread]);
      setActiveThreadId(id);
    }
    setView('chat');
  };

  const handleCreateThread = (): string => {
    const id = crypto.randomUUID();
    const newThread: ChatThread = {
      id,
      title: 'New Conversation',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(id);
    return id;
  };

  const handleUpdateThread = (
    threadId: string,
    messages: ChatMessage[],
    title?: string
  ) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              title: title ?? t.title,
              messages,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleClearThread = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              title: 'New Conversation',
              messages: [],
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => {
      const remaining = prev.filter((t) => t.id !== threadId);
      if (activeThreadId === threadId) {
        setActiveThreadId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
  };

  const handleNavigate = (nextView: AppView) => {
    setView(nextView);
    setIsMobileSidebarOpen(false);
  };

  const userName = profile?.name?.trim() || 'Friend';

  return (
    <div className="relative min-h-screen text-slate-100">
      <StarfieldBackground />

      {view === 'landing' ? (
        <LandingPage
          profile={profile}
          onStartOnboarding={() => setIsOnboardingOpen(true)}
          onNavigateView={(nextView) => handleNavigate(nextView)}
        />
      ) : (
        <div className="relative z-10 flex h-screen w-full overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#080818]/85 backdrop-blur-xl lg:flex">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={() => handleNavigate('landing')}
                className="font-display text-lg font-semibold tracking-tight text-white hover:text-violet-200 transition-colors cursor-pointer"
              >
                FutureMe AI
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-3 overflow-y-auto" aria-label="Workspace">
              {WORKSPACE_NAV.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 text-white border border-violet-400/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-4 space-y-2.5">
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-left transition-colors hover:bg-white/10 cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-violet-300 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{userName}</p>
                  <p className="truncate text-[11px] text-slate-400">Edit Future Profile</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('landing')}
                className="w-full rounded-lg py-1.5 text-center text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Back to Overview
              </button>
            </div>
          </aside>

          {/* Mobile Drawer Backdrop */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <aside className="relative z-50 flex w-72 max-w-[80vw] flex-col border-r border-white/10 bg-[#09091e]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleNavigate('landing')}
                    className="font-display text-lg font-semibold text-white cursor-pointer"
                  >
                    FutureMe AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-label="Close navigation menu"
                    className="rounded-lg p-1.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                  {WORKSPACE_NAV.map((item) => {
                    const Icon = item.icon;
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-violet-600/25 text-white border border-violet-400/30'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="border-t border-white/10 p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileSidebarOpen(false);
                      setIsOnboardingOpen(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-left cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4 text-violet-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">{userName}</p>
                      <p className="text-[11px] text-slate-400">Edit Future Profile</p>
                    </div>
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Main Content Viewport */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Compact Mobile Top Bar */}
            <header className="flex items-center justify-between border-b border-white/10 bg-[#080818]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="rounded-lg p-2 text-slate-200 hover:bg-white/10 cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-display text-base font-semibold text-white">
                FutureMe AI
              </span>
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 cursor-pointer"
              >
                Profile
              </button>
            </header>

            <main
              className={`min-h-0 flex-1 ${
                view === 'chat' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'
              }`}
            >
              {view === 'chat' && (
                <FutureChatView
                  profile={profile}
                  threads={threads}
                  activeThreadId={activeThreadId}
                  goals={goals}
                  visions={visions}
                  onSelectThread={(id) => setActiveThreadId(id)}
                  onCreateThread={handleCreateThread}
                  onUpdateThread={handleUpdateThread}
                  onClearThread={handleClearThread}
                  onDeleteThread={handleDeleteThread}
                  onEditProfile={() => setIsOnboardingOpen(true)}
                />
              )}

              {view === 'dashboard' && (
                <DashboardView
                  profile={profile}
                  threads={threads}
                  letters={letters}
                  affirmations={affirmations}
                  goals={goals}
                  onNavigate={handleNavigate}
                  onOpenThread={(id) => {
                    setActiveThreadId(id);
                    handleNavigate('chat');
                  }}
                  onEditProfile={() => setIsOnboardingOpen(true)}
                />
              )}

              {view === 'vision' && (
                <VisionBoardView
                  visions={visions}
                  onAddVision={(item) => setVisions((prev) => [item, ...prev])}
                  onDeleteVision={(id) =>
                    setVisions((prev) => prev.filter((v) => v.id !== id))
                  }
                />
              )}

              {view === 'letter' && (
                <FutureLetterView
                  profile={profile}
                  letters={letters}
                  onSaveLetter={(letter) =>
                    setLetters((prev) => [
                      letter,
                      ...prev.filter((l) => l.id !== letter.id),
                    ])
                  }
                  onDeleteLetter={(id) =>
                    setLetters((prev) => prev.filter((l) => l.id !== id))
                  }
                />
              )}

              {view === 'affirmations' && (
                <AffirmationsView
                  profile={profile}
                  affirmations={affirmations}
                  onSetAffirmations={setAffirmations}
                  onToggleFavorite={(id) =>
                    setAffirmations((prev) =>
                      prev.map((a) =>
                        a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
                      )
                    )
                  }
                />
              )}

              {view === 'goals' && (
                <GoalTrackerView
                  profile={profile}
                  goals={goals}
                  onAddGoal={(goal) => setGoals((prev) => [goal, ...prev])}
                  onUpdateGoal={(updated) =>
                    setGoals((prev) =>
                      prev.map((g) => (g.id === updated.id ? updated : g))
                    )
                  }
                  onDeleteGoal={(id) =>
                    setGoals((prev) => prev.filter((g) => g.id !== id))
                  }
                />
              )}
            </main>
          </div>
        </div>
      )}

      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={profile}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
