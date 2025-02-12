import { tokenize } from "./tokenizer";

/**
 * Splits the phonemes into chunks while respecting the token limit.
 * First splits by punctuation and then segments any part that exceeds the limit.
 *
 * @param phonemes - The phoneme string.
 * @param tokensPerChunk - Maximum number of tokens per chunk.
 * @returns An array of strings where each string is a chunk.
 */
export function chunkPhonemes(
  phonemes: string,
  tokensPerChunk: number,
): string[] {
  const segments: string[] = [];
  const parts = phonemes.split(/([,.;:!?]+)/g); // preserve punctuation
  let currentSegment = "";

  function flushCurrent() {
    if (currentSegment.trim()) {
      segments.push(currentSegment.trim());
      currentSegment = "";
    }
  }

  // Helper function to split a part that is too long.
  function splitLongPart(part: string) {
    const tokenArr = tokenize(part);
    let idx = 0;
    while (idx < tokenArr.length) {
      const chunkTokens = tokenArr.slice(idx, idx + tokensPerChunk);
      segments.push(chunkTokens.join(""));
      idx += tokensPerChunk;
    }
  }

  const isPunctuation = (s: string) => /^[,.;:!?]+$/.test(s);

  for (const part of parts) {
    if (!part.trim()) continue;

    // If the part is punctuation, always add it to the current chunk (on the left side)
    if (isPunctuation(part)) {
      const tentative = currentSegment + part;
      if (tokenize(tentative).length <= tokensPerChunk) {
        currentSegment = tentative;
      } else {
        flushCurrent();
        // If the punctuation alone exceeds the limit, split it
        if (tokenize(part).length > tokensPerChunk) {
          splitLongPart(part);
        } else {
          currentSegment = part;
        }
      }
      continue;
    }

    // For text (non-punctuation)
    const tentative = currentSegment + part;
    if (tokenize(tentative).length <= tokensPerChunk) {
      currentSegment = tentative;
    } else {
      flushCurrent();
      if (tokenize(part).length > tokensPerChunk) {
        // Split the part into several chunks
        splitLongPart(part);
      } else {
        currentSegment = part;
      }
    }
  }
  flushCurrent();
  return segments;
}
