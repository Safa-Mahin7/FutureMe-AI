import { FutureSelfProfile, GoalItem, LetterHorizon, VisionItem } from '../types';

export function summarizeGoals(goals: GoalItem[]): string {
  if (!goals.length) return '';
  return goals
    .slice(0, 5)
    .map((g) => {
      const done = g.milestones.filter((m) => m.completed).length;
      return `- ${g.title} (${done}/${g.milestones.length} milestones completed, target ${g.targetDate})`;
    })
    .join('\n');
}

export function summarizeVisions(visions: VisionItem[]): string {
  if (!visions.length) return '';
  return visions
    .slice(0, 5)
    .map((v) => `- [${v.category}] ${v.title}: ${v.description}`)
    .join('\n');
}

export async function streamFutureSelfChat(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  profile: FutureSelfProfile | null;
  goals: GoalItem[];
  visions: VisionItem[];
  onChunk: (chunkText: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 45000);

  const onExternalAbort = () => timeoutController.abort();
  params.signal?.addEventListener('abort', onExternalAbort);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: timeoutController.signal,
      body: JSON.stringify({
        messages: params.messages,
        profile: params.profile,
        goalsSummary: summarizeGoals(params.goals),
        visionSummary: summarizeVisions(params.visions),
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to reach your Future Self.';
      try {
        const errData = await response.json();
        if (errData?.error) errorMessage = errData.error;
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as { text?: string; error?: string };
      if (data.error) throw new Error(data.error);
      if (!data.text?.trim()) {
        throw new Error('Your Future Self returned an empty response. Please try again.');
      }
      params.onChunk(data.text);
      return data.text;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Streaming response is unavailable.');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    const processEventBlock = (block: string) => {
      const lines = block.split(/\r?\n/);
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const rawJson = line.slice(6).trim();
        if (!rawJson) continue;
        const payload = JSON.parse(rawJson) as {
          text?: string;
          done?: boolean;
          error?: string;
        };

        if (payload.error) {
          throw new Error(payload.error);
        }
        if (payload.text) {
          fullText += payload.text;
          params.onChunk(fullText);
        }
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? '';

      for (const evt of events) {
        if (evt.trim()) processEventBlock(evt);
      }
    }

    if (buffer.trim()) {
      processEventBlock(buffer);
    }

    if (!fullText.trim()) {
      throw new Error(
        'No response was received from your Future Self. Please click Retry to try again.'
      );
    }

    return fullText;
  } catch (err) {
    if (params.signal?.aborted) {
      throw err;
    }
    if ((err as Error).name === 'AbortError') {
      throw new Error('The response took too long to arrive. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    params.signal?.removeEventListener('abort', onExternalAbort);
  }
}

export async function generateFutureLetter(params: {
  horizon: LetterHorizon;
  focusNote?: string;
  profile: FutureSelfProfile | null;
}): Promise<{ title: string; content: string }> {
  const response = await fetch('/api/letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Could not generate your letter.');
  }
  return data as { title: string; content: string };
}

export async function generatePersonalizedAffirmations(params: {
  profile: FutureSelfProfile | null;
  focusTopic?: string;
}): Promise<Array<{ text: string; focusArea: string }>> {
  const response = await fetch('/api/affirmations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Could not generate affirmations.');
  }
  return (data.affirmations || []) as Array<{ text: string; focusArea: string }>;
}

export async function generateGoalRoadmap(params: {
  dream: string;
  category: string;
  targetDate: string;
  profile: FutureSelfProfile | null;
}): Promise<{
  milestones: Array<{ title: string; tip: string; targetDate: string }>;
  encouragement: string;
}> {
  const response = await fetch('/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Could not generate your action roadmap.');
  }
  return data;
}

export async function fetchGoalAdvice(params: {
  goalTitle: string;
  completedCount: number;
  totalCount: number;
  nextMilestone?: string;
  profile: FutureSelfProfile | null;
}): Promise<string> {
  const response = await fetch('/api/goal-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Could not fetch advice right now.');
  }
  return data.advice || '';
}
