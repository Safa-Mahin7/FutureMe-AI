import { handleLetter, ServerRequest, ServerResponse } from './_lib/gemini';

export default async function handler(req: ServerRequest, res: ServerResponse): Promise<void> {
  await handleLetter(req, res);
}
