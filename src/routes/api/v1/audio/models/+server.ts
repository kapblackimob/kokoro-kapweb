import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { models } from "$lib/shared/resources";

/**
 * @api {get} /v1/audio/models List available models
 * @apiName ListModels
 * @apiGroup Speech
 *
 * @apiSuccess {Object[]} models List of available models
 * @apiSuccess {String} models.id Model ID
 * @apiSuccess {String} models.quantization Model quantization type
 * @apiSuccess {String} models.size Model size in MB
 *
 * @apiSuccessExample {Object[]} Success-Response:
 *   [
 *     {
 *       "id": "model",
 *       "quantization": "fp32",
 *       "size": "326 MB",
 *     }
 *   ]
 */

export const GET: RequestHandler = async () => {
  return json(models);
};
