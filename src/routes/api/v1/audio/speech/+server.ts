import { error } from "@sveltejs/kit";
import wavefile from "wavefile";
import zod from "zod";
import { fromError } from "zod-validation-error";
import type { RequestHandler } from "./$types";
import { generateVoice } from "$lib/shared/kokoro";
import {
  voicesIds,
  modelsIds,
  voicesMap,
  type VoiceId,
  type ModelId,
} from "$lib/shared/resources";

/**
 * @api {post} /v1/audio/speech Generate audio from the input text
 * @apiName CreateSpeech
 * @apiGroup Speech
 *
 * @apiBody {String} model Model to use for the synthesis
 * @apiBody {String} voice Voice to use for the synthesis
 * @apiBody {String} input Input text to synthesize
 * @apiBody {String} [response_format=mp3] Response format, either `mp3` or `wav`
 * @apiBody {Number} [speed=1] Speed of the synthesis, between 0.25 and 5
 *
 * @apiSuccess {File} audio Audio file with the synthesized speech
 *
 * @apiSuccessExample {File} Success-Response:
 *  HTTP/1.1 200 OK
 *  Content-Type: audio/wav
 *
 * @apiError (400) {String} message Error message
 *
 * @apiErrorExample {json} Error-Response:
 *   {
 *     "message": "Validation error ..."
 *   }
 */

const schema = zod.object({
  model: zod.string().refine((val) => modelsIds.includes(val as ModelId), {
    message: `Model not found, use one of: ${modelsIds.join(", ")}`,
  }),
  voice: zod.string().refine((val) => voicesIds.includes(val as VoiceId), {
    message: `Voice not found, use one of: ${voicesIds.join(", ")}`,
  }),
  input: zod.string(),
  response_format: zod.enum(["mp3", "wav"]).default("mp3").optional(),
  speed: zod.number().min(0.25).max(5).default(1).optional(),
});

export const POST: RequestHandler = async ({ request }) => {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return error(400, fromError(parsed.error).toString());
  }

  const { model, input, voice } = parsed.data;

  const vw = voicesMap[voice as VoiceId] ?? voicesMap["af_alloy"];
  const lang = vw.lang;

  const waveform = await generateVoice({
    text: input,
    lang: lang.id,
    voices: [{ voiceId: vw.id, weight: 1 }],
    model,
    speed: 1,
    webgpu: false,
  });

  let wav = new wavefile.WaveFile();
  wav.fromScratch(1, 24000, "32f", waveform);
  const wavBuffer = wav.toBuffer();

  return new Response(wavBuffer, {
    headers: {
      "Content-Type": "audio/wav",
    },
  });
};
