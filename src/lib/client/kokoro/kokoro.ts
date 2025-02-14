import * as ort from "onnxruntime-web/webgpu";
import { getModel } from "$lib/shared/resources";
import type { LangId, ModelId } from "$lib/shared/resources";
import { detectWebGPU } from "$lib/client/utils";
import { combineVoices, type VoiceWeight } from "./combineVoices";
import { preprocessText, type TextProcessorChunk } from "./textProcessor";
import { trimWaveform } from "./trimWaveform";

// This should match the version of onnxruntime-web in the package.json
ort.env.wasm.wasmPaths =
  "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0-dev.20250206-d981b153d3/dist/";

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
  webgpu: boolean;
}): Promise<Float32Array> {
  if (params.webgpu && !detectWebGPU()) {
    throw new Error("WebGPU is not supported in this browser");
  }

  const tokensPerChunk = MODEL_CONTEXT_WINDOW - 2;
  const chunks: TextProcessorChunk[] = await preprocessText(
    params.text,
    params.lang,
    tokensPerChunk,
  );

  const modelBuffer = await getModel(params.model);
  const combinedVoice = await combineVoices(params.voices);

  let sessionOpts: ort.InferenceSession.SessionOptions = {};
  if (params.webgpu) sessionOpts = { executionProviders: ["webgpu"] };
  const session = await ort.InferenceSession.create(modelBuffer, sessionOpts);

  const waveforms: Float32Array[] = [];
  let waveformsLen = 0;

  // Process each chunk based on its type.
  for (const chunk of chunks) {
    console.log(chunk); // Debug log.

    if (chunk.type === "silence") {
      const silenceLength = Math.floor(chunk.durationSeconds * SAMPLE_RATE);
      const silenceWave = new Float32Array(silenceLength);
      waveforms.push(silenceWave);
      waveformsLen += silenceLength;
    }

    if (chunk.type === "text") {
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

  return finalWaveform;
}
