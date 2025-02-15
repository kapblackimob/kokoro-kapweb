import { error, json } from "@sveltejs/kit";
import zod from "zod";
import { fromError } from "zod-validation-error";
import type { RequestHandler } from "./$types";
import { phonemize } from "$lib/shared/phonemizer";
import { langsIds, type LangId } from "$lib/shared/resources";

const schema = zod.object({
  lang: zod.string().refine((val) => langsIds.includes(val as LangId), {
    message: `Voice not found, use one of: ${langsIds.join(", ")}`,
  }),
  input: zod.string(),
});

export const GET: RequestHandler = async ({ url }) => {
  const parsed = schema.safeParse({
    lang: url.searchParams.get("lang"),
    input: url.searchParams.get("input"),
  });
  if (!parsed.success) {
    return error(400, fromError(parsed.error).toString());
  }

  const phonemes = await phonemize(parsed.data.input, parsed.data.lang);
  return json({ phonemes });
};

export const POST: RequestHandler = async ({ request }) => {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return error(400, fromError(parsed.error).toString());
  }

  const phonemes = await phonemize(parsed.data.input, parsed.data.lang);
  return json({ phonemes });
};
