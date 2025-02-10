import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { phonemize } from "$lib/server/phonemizer";

export const GET: RequestHandler = async ({ url }) => {
  const text = url.searchParams.get("text");
  const lang = url.searchParams.get("lang");
  if (!text) error(400, "text query parameter is required");
  if (!lang) error(400, "lang query parameter is required");

  const phonemes = await phonemize(text, lang);
  return json({ phonemes });
};

export const POST: RequestHandler = async ({ request }) => {
  const { text, lang } = await request.json();
  if (!text) error(400, "text query parameter is required");
  if (!lang) error(400, "lang query parameter is required");

  const phonemes = await phonemize(text, lang);
  return json({ phonemes });
};
