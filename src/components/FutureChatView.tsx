import { useEffect, useRef, useState } from 'react';
import {
  History,
  MessageSquarePlus,
  Send,
  Square,
  Trash2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { SUGGESTED_CHAT_PROMPTS } from '../lib/assets';
import { streamFutureSelfChat } from '../lib/api';
import {
  ChatMessage,
  ChatThread,
  FutureSelfProfile,
  GoalItem,
  VisionItem,
} from '../types';

interface FutureChatViewProps {
  profile: FutureSelfProfile | null;
  threads: ChatThread[];
  activeThreadId: string | null;
  goals: GoalItem[];
  visions: VisionItem[];
  onSelectThread: (id: string) => void;
  onCreateThread: () => string;
  onUpdateThread: (threadId: string, messages: ChatMessage[], title?: string) => void;
  onClearThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onEditProfile: () => void;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function FutureChatView({
  profile,
  threads,
  activeThreadId,
  goals,
  visions,
  onSelectThread,
  onCreateThread,
  onUpdateThread,
  onClearThread,
  onDeleteThread,
  onEditProfile,
}: FutureChatViewProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || null;
  const messages = activeThread?.messages ?? [];

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingText, isStreaming]);

  useEffect(() => {
    setConfirmClear(false);
  }, [activeThread?.id]);

  const revealReply = async (fullText: string, signal: AbortSignal): Promise<string> => {
    const trimmed = fullText.trim();
    if (!trimmed) return '';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return trimmed;
    }

    const words = trimmed.split(/(\s+)/);
    const stepSize = Math.max(2, Math.ceil(words.length / 45));
    let index = 0;

    while (index < words.length) {
      if (signal.aborted) {
        return words.slice(0, index).join('').trim() || trimmed;
      }
      index = Math.min(words.length, index + stepSize);
      setStreamingText(words.slice(0, index).join(''));
      await new Promise((r) => setTimeout(r, 18));
    }

    return trimmed;
  };

  const sendMessage = async (textOverride?: string) => {
    const content = (textOverride ?? input).trim();
    if (!content || isStreaming) return;

    setError(null);
    let targetThreadId = activeThread?.id;
    if (!targetThreadId) {
      targetThreadId = onCreateThread();
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    const derivedTitle =
      messages.length === 0
        ? content.length > 42
          ? `${content.slice(0, 42)}...`
          : content
        : activeThread?.title;

    onUpdateThread(targetThreadId, nextMessages, derivedTitle);
    if (!textOverride) setInput('');

    setIsStreaming(true);
    setStreamingText('');
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await streamFutureSelfChat({
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        profile,
        goals,
        visions,
        onChunk: () => {},
        signal: controller.signal,
      });

      if (!reply.trim()) {
        throw new Error('Your Future Self did not return a reply. Please try again.');
      }

      const finalContent = await revealReply(reply, controller.signal);
      if (controller.signal.aborted) return;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString(),
      };

      onUpdateThread(targetThreadId, [...nextMessages, assistantMessage], derivedTitle);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError((err as Error).message || 'Unable to connect to your Future Self.');
      }
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    if (streamingText.trim() && activeThread) {
      const partialMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: streamingText.trim(),
        timestamp: new Date().toISOString(),
      };
      onUpdateThread(activeThread.id, [...messages, partialMsg]);
    }
    setIsStreaming(false);
    setStreamingText('');
    abortRef.current = null;
  };

  const handleRetryLast = async () => {
    if (!messages.length || isStreaming || !activeThread) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'user') return;

    setError(null);
    setIsStreaming(true);
    setStreamingText('');
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await streamFutureSelfChat({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        profile,
        goals,
        visions,
        onChunk: () => {},
        signal: controller.signal,
      });

      if (!reply.trim()) {
        throw new Error('Your Future Self did not return a reply. Please try again.');
      }

      const finalContent = await revealReply(reply, controller.signal);
      if (controller.signal.aborted) return;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString(),
      };

      onUpdateThread(activeThread.id, [...messages, assistantMessage]);
    } catch (err) {
      if (!controller.signal.aborted) {
        setError((err as Error).message || 'Unable to connect to your Future Self.');
      }
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      abortRef.current = null;
    }
  };

  const handleClearCurrent = () => {
    if (!activeThread) return;
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClearThread(activeThread.id);
    setConfirmClear(false);
    setError(null);
  };

  const userName = profile?.name?.trim() || 'Friend';

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">
      {/* Main Conversational Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Context Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#09091d]/70 px-5 py-3.5 backdrop-blur-xl">
          <div className="min-w-0">
            <h1 className="font-display truncate text-base font-semibold text-white sm:text-lg">
              {activeThread?.title || `Conversation with Future ${userName}`}
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Future {userName}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-xs">
                {profile?.careerAmbition || '5 Years Ahead'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onCreateThread()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Chat</span>
            </button>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearCurrent}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  confirmClear
                    ? 'border-rose-400/50 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{confirmClear ? 'Confirm Clear' : 'Clear'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showHistory
                  ? 'border-violet-400/40 bg-violet-500/20 text-violet-100'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">History</span>
              <span className="font-mono tabular-nums text-[11px] text-slate-400">
                {threads.length}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 0 && !isStreaming ? (
              <div className="py-8 sm:py-12">
                <div className="glass-surface-elevated rounded-3xl p-7 sm:p-9">
                  <p className="text-xs font-medium text-violet-300">
                    {userName} · Envisioned Future Self
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-semibold text-white sm:text-3xl">
                    Hey {userName}, I&apos;m glad you stopped by.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {profile?.careerAmbition
                      ? `I remember how deeply you care about ${profile.careerAmbition}. Whatever you are carrying right now—excitement, doubt, or a tough day—let's talk through it together.`
                      : 'Tell me what is on your mind today—your ambitions, doubts, or what you want to build next. You can also start with one of the reflections below.'}
                  </p>

                  {!profile && (
                    <button
                      type="button"
                      onClick={onEditProfile}
                      className="mt-4 inline-flex items-center rounded-xl border border-violet-400/30 bg-violet-500/15 px-4 py-2 text-xs font-medium text-violet-200 hover:bg-violet-500/25 cursor-pointer"
                    >
                      Complete your 10-step profile for deeper personalization
                    </button>
                  )}

                  <div className="mt-7">
                    <p className="text-xs font-medium text-slate-400 mb-3">
                      Suggested conversation starters
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {SUGGESTED_CHAT_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void sendMessage(prompt)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-left text-xs font-medium text-slate-200 transition-all hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="mb-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300">
                          {isUser ? userName : `Future ${userName}`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      <div
                        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-br from-violet-600/90 to-fuchsia-600/85 text-white shadow-lg shadow-violet-950/40'
                            : 'glass-surface-elevated text-slate-100'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {isStreaming && (
                  <div className="flex flex-col items-start">
                    <div className="mb-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-medium text-violet-300">Future {userName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Thinking...</span>
                    </div>
                    <div className="glass-surface-elevated max-w-[88%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">
                      {streamingText ? (
                        streamingText
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-bounce" />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-400/30 bg-rose-950/40 p-4 text-sm text-rose-200"
                role="alert"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-300" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetryLast}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/30 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>
        </div>

        {/* Message Composer */}
        <div className="border-t border-white/10 bg-[#080818]/85 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto max-w-3xl">
            {messages.length > 0 && !isStreaming && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {SUGGESTED_CHAT_PROMPTS.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:border-violet-400/40 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex items-end gap-3 rounded-2xl border border-white/15 bg-[#0e0f27]/90 p-2.5 focus-within:border-violet-400/60 focus-within:ring-2 focus-within:ring-violet-500/20"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={`Write to your future self, ${userName}...`}
                className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-2.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  aria-label="Stop response"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 shrink-0 cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-35 disabled:pointer-events-none shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              )}
            </form>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              Motivational visualization grounded in your goals — never a prediction of the actual
              future.
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Chat History Drawer */}
      {showHistory && (
        <aside className="w-72 shrink-0 border-l border-white/10 bg-[#09091e]/95 p-4 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="font-display text-sm font-semibold text-white">Conversations</h2>
            <button
              type="button"
              onClick={() => onCreateThread()}
              className="text-xs font-medium text-violet-300 hover:text-violet-200 cursor-pointer"
            >
              + New
            </button>
          </div>

          <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto">
            {threads.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Your saved conversations will appear here.
              </p>
            ) : (
              threads.map((thread) => {
                const isActive = thread.id === activeThread?.id;
                return (
                  <div
                    key={thread.id}
                    className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'bg-violet-500/20 text-white border border-violet-400/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectThread(thread.id)}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <p className="truncate text-xs font-medium">{thread.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400 tabular-nums">
                        {thread.messages.length} msgs
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteThread(thread.id)}
                      aria-label={`Delete conversation ${thread.title}`}
                      className="rounded-lg p-1.5 text-slate-500 opacity-70 hover:bg-white/10 hover:text-rose-300 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
