import * as ort from "onnxruntime-web";
import { getModel, getShapedVoiceFile, type VoiceId } from "../resources";
import { tokenize } from "./tokenizer";
import { apiClient } from "$lib/client/api";

ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

export async function generateVoice(params: {
  text: string;
  lang: "en-us" | "en-gb" | "es-la" | "es-es";
  voice: VoiceId;
  speed: number;
}): Promise<Float32Array> {
  const modelBuffer = await getModel("model_q8f16");
  const session = await ort.InferenceSession.create(modelBuffer);

  const phonemes = await apiClient.phonemize(params.text, params.lang);
  const tokens = tokenize(phonemes);

  const shapedVoice = await getShapedVoiceFile(params.voice);
  const ref_s = shapedVoice[tokens.length - 1][0];

  const paddedTokens = [0, ...tokens, 0];

  const input_ids = new ort.Tensor("int64", paddedTokens, [
    1,
    paddedTokens.length,
  ]);

  const style = new ort.Tensor("float32", ref_s, [1, ref_s.length]);

  const speed = new ort.Tensor("float32", [params.speed], [1]);
  const result = await session.run({
    input_ids,
    style,
    speed,
  });

  const waveform = await result["waveform"].getData();
  return waveform as Float32Array;
}
