import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { generateVoice } from "$lib/shared/kokoro";
import wavefile from "wavefile";
import { voicesMap, type VoiceId } from "$lib/shared/resources";

export const POST: RequestHandler = async ({ request }) => {
  const { model, input, voice } = await request.json();
  if (!model) error(400, "model is required");
  if (!input) error(400, "input is required");
  if (!voice) error(400, "voice is required");

  const vw = voicesMap[voice as VoiceId] ?? voicesMap["af_alloy"];
  const lang = vw.lang;

  const waveform = await generateVoice({
    text: input,
    lang,
    voices: [{ voiceId: vw.voiceId, weight: 1 }],
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
