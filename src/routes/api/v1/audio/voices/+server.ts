import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { voices } from "$lib/shared/resources";

/**
 * @api {get} /v1/audio/voices List available voices
 * @apiName ListVoices
 * @apiGroup Speech
 *
 * @apiSuccess {Object[]} voices List of available voices
 * @apiSuccess {String} voices.id Voice ID
 * @apiSuccess {String} voices.name Voice name
 * @apiSuccess {String} voices.gender Voice gender
 * @apiSuccess {String} voices.targetQuality Voice target quality
 * @apiSuccess {String} voices.overallGrade Voice overall grade
 * @apiSuccess {Object} voices.lang Voice language
 * @apiSuccess {String} voices.lang.id Language ID
 * @apiSuccess {String} voices.lang.name Language name
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *     {
 *       "id": "af_heart",
 *       "name": "Heart",
 *       "gender": "Female",
 *       "targetQuality": "A",
 *       "overallGrade": "A",
 *       "lang": {
 *         "id": "en-us",
 *         "name": "English (US)"
 *       }
 *     }
 *   ]
 */

export const GET: RequestHandler = async () => {
  return json(voices);
};
