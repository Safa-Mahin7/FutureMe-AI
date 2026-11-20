import { handleRoadmap, type ServerRequest, type ServerResponse } from './_lib/gemini.js';

export default async function handler(req: ServerRequest, res: ServerResponse): Promise<void> {
  await handleRoadmap(req, res);
}
