import { error, json } from "@sveltejs/kit";
import zod from "zod";
import { fromError } from "zod-validation-error";
import type { RequestHandler } from "./$types";
import { phonemize } from "$lib/shared/phonemizer";
import { langsIds, type LangId } from "$lib/shared/resources";

/**
 * @api {post} /v1/text/phonemize Generate text phonemes
 * @apiName PhonemizeText
 * @apiGroup Text
 *
 * @apiBody {String} lang Language ID
 * @apiBody {String} input Input text to phonemize
 *
 * @apiSuccess {String} phonemes Phonemes of the input text
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *      "phonemes": "..."
 *   }
 *
 * @apiError (400) {String} message Error message
 *
 * @apiErrorExample {json} Error-Response:
 *   {
 *      "message": "Validation error ..."
 *   }
 */

const schema = zod.object({
  lang: zod.string().refine((val) => langsIds.includes(val as LangId), {
    message: `Voice not found, use one of: ${langsIds.join(", ")}`,
  }),
  input: zod.string(),
});

export const POST: RequestHandler = async ({ request }) => {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return error(400, fromError(parsed.error).toString());
  }

  const phonemes = await phonemize(parsed.data.input, parsed.data.lang);
  return json({ phonemes });
};
