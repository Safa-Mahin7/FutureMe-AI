import { GenerateContentResponse, GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

export interface ServerRequest {
  method?: string;
  body?: unknown;
}

export interface ServerResponse {
  status(code: number): ServerResponse;
  json(body: unknown): unknown;
  setHeader(name: string, value: string): unknown;
  end(): unknown;
}

export interface ProfileInput {
  name?: string;
  age?: string;
  currentRole?: string;
  careerAmbition?: string;
  fiveYearVision?: string;
  personalDreams?: string;
  currentChallenges?: string;
  skillsToDevelop?: string;
  idealLifestyle?: string;
  personalityStyle?: string;
}

export function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY to your environment variables.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseJsonBody<T>(req: ServerRequest): T {
  if (req.body === undefined || req.body === null) {
    return {} as T;
  }
  if (typeof req.body === 'string') {
    if (!req.body.trim()) return {} as T;
    return JSON.parse(req.body) as T;
  }
  return req.body as T;
}

function allowMethod(
  req: ServerRequest,
  res: ServerResponse,
  expected: 'GET' | 'POST'
): boolean {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }
  if (req.method && req.method !== expected) {
    res.setHeader('Allow', expected);
    res.status(405).json({ error: `Method ${req.method} not allowed. Use ${expected}.` });
    return false;
  }
  return true;
}

function formatProfileContext(profile?: ProfileInput): string {
  if (!profile) {
    return 'No detailed profile provided yet. Treat the user warmly as someone exploring their future potential.';
  }
  const lines = [
    `Name: ${profile.name?.trim() || 'Friend'}`,
    profile.age?.trim() ? `Current Age: ${profile.age.trim()}` : null,
    profile.currentRole?.trim() ? `Current Situation / Study / Work: ${profile.currentRole.trim()}` : null,
    profile.careerAmbition?.trim() ? `Biggest Career Ambition: ${profile.careerAmbition.trim()}` : null,
    profile.fiveYearVision?.trim() ? `5-Year Vision: ${profile.fiveYearVision.trim()}` : null,
    profile.personalDreams?.trim() ? `Personal Dreams: ${profile.personalDreams.trim()}` : null,
    profile.currentChallenges?.trim() ? `Current Challenges: ${profile.currentChallenges.trim()}` : null,
    profile.skillsToDevelop?.trim() ? `Skills Developing / Desired: ${profile.skillsToDevelop.trim()}` : null,
    profile.idealLifestyle?.trim() ? `Ideal Future Lifestyle: ${profile.idealLifestyle.trim()}` : null,
    profile.personalityStyle?.trim() ? `Motivating Future-Self Personality: ${profile.personalityStyle.trim()}` : null,
  ].filter(Boolean);

  return lines.join('\n');
}

function buildFutureSelfInstruction(
  profile?: ProfileInput,
  goalsSummary?: string,
  visionSummary?: string
): string {
  const personality =
    profile?.personalityStyle?.trim() ||
    'Warm, grounded, emotionally intelligent, and encouraging';
  const name = profile?.name?.trim() || 'Friend';

  return `You are the user's envisioned future self, speaking from 5 years ahead.
Your name is also ${name}, and you are speaking directly to your younger, present-day self ("you" / "${name}").

USER'S ENVISIONED PROFILE:
${formatProfileContext(profile)}

${goalsSummary ? `ACTIVE GOALS & MILESTONES:\n${goalsSummary}\n` : ''}
${visionSummary ? `VISION BOARD HIGHLIGHTS:\n${visionSummary}\n` : ''}

CORE IDENTITY & VOICE GUIDELINES:
1. Speak in first person ("I remember when we...", "Looking back at where you are right now...") as the version of ${name} who stayed consistent and grew into this envisioned life.
2. Adopt this requested motivational tone: ${personality}.
3. Reference specific details from ${name}'s profile, challenges, skills, and dreams naturally—never sound generic or robotic.
4. CRITICAL REALISM BOUNDARY: This is a motivational visualization experience, NOT a prediction of the actual future. NEVER guarantee that specific outcomes will definitely happen, NEVER claim prophetic or supernatural knowledge of future events, and NEVER create unrealistic pressure. Frame your perspective as the envisioned future we are actively building together through today's choices.
5. When ${name} shares doubts, burnout, fear, or struggles, respond with genuine empathy first, validate how hard the current chapter feels, and suggest 1–3 small, realistic, manageable next steps they can take today.
6. Celebrate small wins warmly. Keep replies focused, heartfelt, and conversational (typically 2–4 well-paced paragraphs unless they ask for a detailed breakdown).`;
}

function unwrapNestedErrorMessage(raw: string): string {
  let current = raw.trim();
  for (let i = 0; i < 4; i++) {
    if (!current.startsWith('{')) break;
    try {
      const parsed = JSON.parse(current) as {
        error?: { message?: string; status?: string; code?: number } | string;
        message?: string;
      };
      if (typeof parsed.error === 'string') {
        current = parsed.error.trim();
      } else if (parsed.error && typeof parsed.error.message === 'string') {
        current = parsed.error.message.trim();
      } else if (typeof parsed.message === 'string') {
        current = parsed.message.trim();
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  return current;
}

export function extractErrorDetails(
  err: unknown
): { status: number; message: string; transient: boolean } {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const cleanMessage = unwrapNestedErrorMessage(rawMessage);
  const statusMatch = rawMessage.match(/\b(400|401|403|404|429|500|503|504)\b/);
  const status = statusMatch ? Number(statusMatch[1]) : 500;

  if (rawMessage.includes('GEMINI_API_KEY is not configured')) {
    return {
      status: 500,
      message:
        'Server configuration error: GEMINI_API_KEY is missing. Please configure GEMINI_API_KEY in your deployment environment variables.',
      transient: false,
    };
  }
  if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message:
        'Gemini API authentication failed. Please verify the server GEMINI_API_KEY environment variable.',
      transient: false,
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || status === 429) {
    return {
      status: 429,
      message: 'Rate limit reached right now. Please wait a few seconds and try again.',
      transient: true,
    };
  }
  if (
    rawMessage.includes('UNAVAILABLE') ||
    rawMessage.includes('high demand') ||
    rawMessage.includes('timed out') ||
    status === 503 ||
    status === 504
  ) {
    return {
      status: 503,
      message:
        'The Gemini AI model is temporarily busy due to high demand. Please retry in a moment.',
      transient: true,
    };
  }
  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: cleanMessage || 'Unable to reach Gemini AI right now.',
    transient: status >= 500,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function generateWithResilience(
  ai: GoogleGenAI,
  buildParams: (model: string) => Parameters<GoogleGenAI['models']['generateContent']>[0]
): Promise<GenerateContentResponse> {
  const attempts: Array<{ model: string; backoffMs: number; timeoutMs: number }> = [
    { model: PRIMARY_MODEL, backoffMs: 0, timeoutMs: 8000 },
    { model: FALLBACK_MODEL, backoffMs: 250, timeoutMs: 8000 },
    { model: PRIMARY_MODEL, backoffMs: 450, timeoutMs: 8000 },
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    if (attempt.backoffMs > 0) {
      await delay(attempt.backoffMs);
    }
    const startedAt = Date.now();
    try {
      const params = buildParams(attempt.model);
      const res = await withTimeout(
        ai.models.generateContent(params),
        attempt.timeoutMs,
        `Gemini ${attempt.model}`
      );
      console.log(
        `[gemini] attempt ${i + 1} (${attempt.model}) succeeded in ${Date.now() - startedAt}ms`
      );
      return res;
    } catch (err) {
      lastError = err;
      const info = extractErrorDetails(err);
      console.warn(
        `[gemini] attempt ${i + 1} (${attempt.model}) failed in ${Date.now() - startedAt}ms: ${info.status} ${info.message}`
      );
      if (!info.transient && info.status !== 404) {
        throw err;
      }
    }
  }
  throw lastError;
}

export async function handleHealth(req: ServerRequest, res: ServerResponse): Promise<void> {
  if (!allowMethod(req, res, 'GET')) return;
  res.status(200).json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
}

export async function handleChat(req: ServerRequest, res: ServerResponse): Promise<void> {
  if (!allowMethod(req, res, 'POST')) return;

  let body: {
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    profile?: ProfileInput;
    goalsSummary?: string;
    visionSummary?: string;
  };

  try {
    body = parseJsonBody(req);
  } catch {
    res.status(400).json({ error: 'Invalid JSON request body.' });
    return;
  }

  const { messages, profile, goalsSummary, visionSummary } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  const sanitized = messages
    .filter((m) => typeof m.content === 'string' && m.content.trim().length > 0)
    .slice(-24);

  if (sanitized.length === 0) {
    res.status(400).json({ error: 'Please enter a non-empty message.' });
    return;
  }

  try {
    const ai = getGenAIClient();
    const systemInstruction = buildFutureSelfInstruction(profile, goalsSummary, visionSummary);
    const contents = sanitized.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await generateWithResilience(ai, (model) => ({
      model,
      contents,
      config:
        model === PRIMARY_MODEL
          ? { systemInstruction, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : { systemInstruction },
    }));

    const text = response.text?.trim();
    if (!text) {
      res.status(502).json({
        error: 'Your future self could not form a response right now. Please try again.',
      });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    const { status, message } = extractErrorDetails(err);
    console.error('[api/chat] Error:', status, message);
    res.status(status).json({ error: message });
  }
}

export async function handleLetter(req: ServerRequest, res: ServerResponse): Promise<void> {
  if (!allowMethod(req, res, 'POST')) return;

  try {
    const { horizon, focusNote, profile } = parseJsonBody<{
      horizon?: string;
      focusNote?: string;
      profile?: ProfileInput;
    }>(req);

    const validHorizon = horizon || '5 years';
    const ai = getGenAIClient();

    const prompt = `Write a deeply personal, heartfelt letter from the user's envisioned future self ${validHorizon} from now.

USER PROFILE:
${formatProfileContext(profile)}

${focusNote?.trim() ? `PRESENT-DAY CONTEXT OR EMOTION THE USER SHARED:\n"${focusNote.trim()}"\n` : ''}

REQUIREMENTS:
- Must begin the letter body directly with "Dear Present Me," (or "Dear Present Me —" on its own opening line).
- Reflect specifically on the user's current situation, challenges, and aspirations.
- Describe the envisioned achievements and daily peace ${validHorizon} ahead as the result of steady growth—never claim guaranteed fortune-telling, instead honor the path being built.
- Encourage consistency, patience, and self-compassion.
- Include practical, meaningful advice tailored to their skills and goals.
- Close warmly with an emotional, grounding sign-off.
- Return JSON with a concise poetic title and the full formatted letter content (using clear paragraph breaks).`;

    const response = await generateWithResilience(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        systemInstruction:
          'You write deeply human, emotionally resonant, grounded letters from an envisioned future self. Never use cliché corporate buzzwords.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Short meaningful title for the letter' },
            content: {
              type: Type.STRING,
              description: 'Complete multi-paragraph letter starting with "Dear Present Me,"',
            },
          },
          required: ['title', 'content'],
        },
      },
    }));

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.status(200).json(parsed);
  } catch (err) {
    const { status, message } = extractErrorDetails(err);
    console.error('[api/letter] Error:', status, message);
    res.status(status).json({ error: message });
  }
}

export async function handleAffirmations(req: ServerRequest, res: ServerResponse): Promise<void> {
  if (!allowMethod(req, res, 'POST')) return;

  try {
    const { profile, focusTopic } = parseJsonBody<{
      profile?: ProfileInput;
      focusTopic?: string;
    }>(req);

    const ai = getGenAIClient();
    const prompt = `Create 6 grounded, empowering first-person affirmations tailored specifically to this person's goals, skills, and challenges.

USER PROFILE:
${formatProfileContext(profile)}
${focusTopic?.trim() ? `REQUESTED FOCUS AREA: ${focusTopic.trim()}` : ''}

GUIDELINES:
- First-person ("I am...", "Every step I take...", "I trust myself to...").
- Specific to their ambitions and struggles without sounding cheesy or unrealistic.
- Focus on growth, resilience, consistency, and capability rather than passive wishful thinking.
- Each affirmation should be 1 crisp, memorable sentence.`;

    const response = await generateWithResilience(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        ...(model === PRIMARY_MODEL
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'The first-person affirmation sentence' },
              focusArea: {
                type: Type.STRING,
                description:
                  '2-3 word theme such as Career Growth, Daily Focus, Self Trust, or Resilience',
              },
            },
            required: ['text', 'focusArea'],
          },
        },
      },
    }));

    const items = JSON.parse((response.text ?? '[]').trim());
    res.status(200).json({ affirmations: items });
  } catch (err) {
    const { status, message } = extractErrorDetails(err);
    console.error('[api/affirmations] Error:', status, message);
    res.status(status).json({ error: message });
  }
}

export async function handleRoadmap(req: ServerRequest, res: ServerResponse): Promise<void> {
  if (!allowMethod(req, res, 'POST')) return;

  try {
    const { dream, category, targetDate, profile } = parseJsonBody<{
      dream?: string;
      category?: string;
      targetDate?: string;
      profile?: ProfileInput;
    }>(req);

    if (!dream?.trim()) {
      res.status(400).json({ error: 'Please enter a dream or goal to build a roadmap.' });
      return;
    }

    const ai = getGenAIClient();
    const prompt = `Turn this user's dream into a realistic, encouraging, step-by-step action roadmap with 6 concrete milestones.

DREAM / GOAL: ${dream.trim()}
CATEGORY: ${category || 'Personal & Career'}
TARGET COMPLETION DATE: ${targetDate || '6 months from today'}
TODAY'S DATE: ${new Date().toISOString().slice(0, 10)}

USER PROFILE:
${formatProfileContext(profile)}

GUIDELINES:
- Sequence milestones logically from foundational first steps to real-world execution (e.g., skills -> practice -> portfolio/proof -> real opportunity).
- Keep milestone titles crisp and action-oriented (4 to 9 words).
- Include a short practical 1-sentence tip for each milestone.
- Suggest a realistic YYYY-MM-DD targetDate for each milestone leading up to the goal target date.`;

    const response = await generateWithResilience(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  tip: { type: Type.STRING },
                  targetDate: { type: Type.STRING, description: 'YYYY-MM-DD format' },
                },
                required: ['title', 'tip', 'targetDate'],
              },
            },
            encouragement: {
              type: Type.STRING,
              description:
                'A warm 1-2 sentence note from their future self about starting this roadmap',
            },
          },
          required: ['milestones', 'encouragement'],
        },
      },
    }));

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.status(200).json(parsed);
  } catch (err) {
    const { status, message } = extractErrorDetails(err);
    console.error('[api/roadmap] Error:', status, message);
    res.status(status).json({ error: message });
  }
}

export async function handleGoalAdvice(req: ServerRequest, res: ServerResponse): Promise<void> {
  if (!allowMethod(req, res, 'POST')) return;

  try {
    const { goalTitle, completedCount, totalCount, nextMilestone, profile } = parseJsonBody<{
      goalTitle?: string;
      completedCount?: number;
      totalCount?: number;
      nextMilestone?: string;
      profile?: ProfileInput;
    }>(req);

    const ai = getGenAIClient();
    const prompt = `Give brief, practical, heartfelt advice (2-3 sentences) from ${
      profile?.name || 'their'
    }'s envisioned future self about their progress on "${goalTitle}".
Completed milestones: ${completedCount ?? 0} of ${totalCount ?? 0}.
${
  nextMilestone
    ? `Up next: "${nextMilestone}".`
    : 'All current milestones are complete—suggest how to celebrate or level up next.'
}
Keep it grounded, warm, and immediately actionable today.`;

    const response = await generateWithResilience(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        systemInstruction: buildFutureSelfInstruction(profile),
        ...(model === PRIMARY_MODEL
          ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
          : {}),
      },
    }));

    res.status(200).json({ advice: response.text ?? '' });
  } catch (err) {
    const { status, message } = extractErrorDetails(err);
    console.error('[api/goal-advice] Error:', status, message);
    res.status(status).json({ error: message });
  }
}
