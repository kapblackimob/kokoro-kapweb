import type { ModelId } from "./models.js";
import type { VoiceId } from "./voices.js";

export * from "./models.js";
export * from "./voices.js";

const downloadUrl =
  "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231";

/**
 * Fetches the model with the given id.
 *
 * @param id The id of the model
 */
export async function getModel(id: ModelId): Promise<ArrayBuffer> {
  const url = `${downloadUrl}/onnx/${id}.onnx`;
  return await getFileFromUrl(url);
}

/**
 * Fetches the voice file with the given id.
 *
 * @param id The id of the voice file
 */
export async function getVoiceFile(id: VoiceId): Promise<ArrayBuffer> {
  const url = `${downloadUrl}/voices/${id}.bin`;
  return await getFileFromUrl(url);
}

/**
 * same as getVoiceFile but reshapes the data into a 3D array with
 * this shape: [number of chunks, 1, 256]
 *
 * This shape is required by the model for inference.
 *
 * @param id The id of the voice file
 */
export async function getShapedVoiceFile(id: VoiceId): Promise<number[][][]> {
  const voice = await getVoiceFile(id);
  const voiceArray = new Float32Array(voice);
  const voiceArrayLen = voiceArray.length;

  const reshaped: number[][][] = [];
  for (let from = 0; from < voiceArray.length; from += 256) {
    const to = Math.min(from + 256, voiceArrayLen);
    const chunk = Array.from(voiceArray.slice(from, to));
    reshaped.push([chunk]);
  }

  return reshaped;
}

/**
 * Fetches a file from the given url, caching it if possible.
 *
 * @param url The url to be fetched
 */
async function getFileFromUrl(url: string): Promise<ArrayBuffer> {
  console.log("Downloading URL:", url);

  let cache: Cache | null = null;
  try {
    cache = await caches.open("kokoro-web-resources");
    const cached = await cache.match(url);
    if (cached) {
      console.log("Downloaded from cache");
      return await cached.arrayBuffer();
    }
  } catch (err) {
    console.warn("Can't open cache:", err);
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch model: ${res.status}`);
  }

  const buf = await res.arrayBuffer();
  if (!cache) return buf;

  try {
    await cache.put(url, new Response(buf, { headers: res.headers }));
  } catch (err) {
    console.warn("Can't cache model:", err);
  }

  console.log("Downloaded from network");
  return buf;
}
