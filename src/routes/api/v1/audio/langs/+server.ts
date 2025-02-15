import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { langs } from "$lib/shared/resources";

/**
 * @api {get} /v1/audio/langs List available languages
 * @apiName ListLanguages
 * @apiGroup Speech
 *
 * @apiSuccess {Object[]} langs List of available languages
 * @apiSuccess {String} langs.id Language ID
 * @apiSuccess {String} langs.name Language name
 *
 * @apiSuccessExample {json} Success-Response:
 *   [
 *     {
 *       "id": "en",
 *       "name": "English",
 *     }
 *   ]
 */

export const GET: RequestHandler = async () => {
  return json(langs);
};
