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
 * @apiSuccessExample {Object[]} Success-Response:
 * HTTP/1.1 200 OK
 * Content-Type: application/json
 * [
 *  {
 *   "id": "en",
 *   "name": "English",
 *  }
 * ]
 */

export const GET: RequestHandler = async () => {
  return json(langs);
};
