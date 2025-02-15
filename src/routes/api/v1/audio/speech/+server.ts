import { json } from "@sveltejs/kit";
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
 * @openapi
 * /api/v1/audio/speech:
 *   post:
 *     summary: Generate audio from the input text
 *     tags:
 *       - Speech
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: Model to use for the synthesis
 *               voice:
 *                 type: string
 *                 description: Voice to use for the synthesis
 *               input:
 *                 type: string
 *                 description: Input text to synthesize
 *               response_format:
 *                 type: string
 *                 enum: [mp3, wav]
 *                 default: mp3
 *                 description: Response format, either `mp3` or `wav`
 *               speed:
 *                 type: number
 *                 minimum: 0.25
 *                 maximum: 5
 *                 default: 1
 *                 description: Speed of the synthesis
 *     responses:
 *       200:
 *         description: Audio file with the synthesized speech
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *             example:
 *               message: "Validation error ..."
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
    return json(
      { message: fromError(parsed.error).toString() },
      { status: 400 },
    );
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
