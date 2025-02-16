import * as wavefile from "wavefile";
import { getModel } from "$lib/shared/resources";
import type { LangId, ModelId } from "$lib/shared/resources";
import { detectWebGPU } from "$lib/client/utils";
import { combineVoices, type VoiceWeight } from "./combineVoices";
import { preprocessText, type TextProcessorChunk } from "./textProcessor";
import { trimWaveform } from "./trimWaveform";
import { getOnnxRuntime } from "./getOnnxRuntime";
import { modifyWavSpeed, wavToMp3 } from "../ffmpeg";

const MODEL_CONTEXT_WINDOW = 512;
const SAMPLE_RATE = 24000; // sample rate in Hz

/**
 * Generates a voice from a given text.
 *
 * The raw text is preprocessed so that silence markers are detected before phonemization.
 * For text segments the phonemizer is called, then punctuation splitting and token generation are applied.
 * Silence chunks produce silent waveforms.
 *
 * @param params - Generation parameters.
 * @returns Concatenated waveform.
 */
export async function generateVoice(params: {
  text: string;
  lang: LangId | string;
  voices: VoiceWeight[];
  model: ModelId | string;
  speed: number;
  format: "wav" | "mp3";
  webgpu: boolean;
}): Promise<{ buffer: ArrayBuffer; mimeType: string }> {
  if (params.webgpu && !detectWebGPU()) {
    throw new Error("WebGPU is not supported in this environment");
  }
  if (params.speed < 0.1 || params.speed > 5) {
    throw new Error("Speed must be between 0.1 and 5");
  }

  const ort = await getOnnxRuntime();

  const tokensPerChunk = MODEL_CONTEXT_WINDOW - 2;
  const chunks: TextProcessorChunk[] = await preprocessText(
    params.text,
    params.lang,
    tokensPerChunk,
  );

  const modelBuffer = await getModel(params.model);
  const combinedVoice = await combineVoices(params.voices);

  let sessionOpts = {};
  if (params.webgpu) sessionOpts = { executionProviders: ["webgpu"] };
  const session = await ort.InferenceSession.create(modelBuffer, sessionOpts);

  const waveforms: Float32Array[] = [];
  let waveformsLen = 0;

  // Process each chunk based on its type.
  for (const chunk of chunks) {
    if (chunk.type === "silence") {
      console.log(chunk);

      const silenceLength = Math.floor(chunk.durationSeconds * SAMPLE_RATE);
      const silenceWave = new Float32Array(silenceLength);
      waveforms.push(silenceWave);
      waveformsLen += silenceLength;
    }

    if (chunk.type === "text") {
      console.log({ type: chunk.type, content: chunk.content });

      const tokens = chunk.tokens;
      const ref_s = combinedVoice[tokens.length - 1][0];
      const paddedTokens = [0, ...tokens, 0];
      const input_ids = new ort.Tensor("int64", paddedTokens, [
        1,
        paddedTokens.length,
      ]);
      const style = new ort.Tensor("float32", ref_s, [1, ref_s.length]);
      // Fixed speed because speed should be implemented as post-processing
      // instead of being a model input to get better results.
      const speed = new ort.Tensor("float32", [1], [1]);

      // Get the raw waveform and trim extra silence duration.
      const result = await session.run({ input_ids, style, speed });
      let waveform = (await result.waveform.getData()) as Float32Array;
      waveform = trimWaveform(waveform);

      waveforms.push(waveform);
      waveformsLen += waveform.length;
    }
  }

  const finalWaveform = new Float32Array(waveformsLen);
  let offset = 0;
  for (const waveform of waveforms) {
    finalWaveform.set(waveform, offset);
    offset += waveform.length;
  }

  let wav = new wavefile.WaveFile();
  wav.fromScratch(1, 24000, "32f", finalWaveform);
  let wavBuffer = wav.toBuffer().buffer as ArrayBuffer;

  if (params.speed !== 1) {
    wavBuffer = await modifyWavSpeed(wavBuffer, params.speed);
  }

  if (params.format === "wav") {
    return { buffer: wavBuffer, mimeType: "audio/wav" };
  }

  return { buffer: await wavToMp3(wavBuffer), mimeType: "audio/mpeg" };
}
