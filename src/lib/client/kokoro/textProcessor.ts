import { tokenize } from "./tokenizer";
import { apiClient } from "$lib/client/apiClient";
import type { LangId } from "$lib/shared/resources";

export interface TextChunk {
  type: "text";
  content: string;
  tokens: number[];
}

export interface SilenceChunk {
  type: "silence";
  durationSeconds: number;
}

export type TextProcessorChunk = TextChunk | SilenceChunk;

/**
 * Checks whether a segment is a silence marker, e.g. "[s1.5]".
 */
export function isSilenceMarker(segment: string): boolean {
  return /^\[s[0-9]+(?:\.[0-9]+)?\]$/.test(segment.trim());
}

/**
 * Extracts the duration from a silence marker.
 * @param marker - The silence marker string, e.g. "[s1.5]".
 * @returns The duration in seconds.
 */
export function extractSilenceDuration(marker: string): number {
  const match = marker.trim().match(/^\[s([0-9]+(?:\.[0-9]+)?)\]$/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Splits the raw input text into segments using silence markers as delimiters.
 * @param rawText - The raw input text.
 * @returns An array of segments.
 */
export function splitInputText(rawText: string): string[] {
  return rawText
    .split(/(\[s[0-9]+(?:\.[0-9]+)?\])/g)
    .filter((s) => s.trim() !== "");
}

/**
 * Splits a long segment into smaller parts that do not exceed tokensPerChunk.
 * @param segment - The segment to split.
 * @param tokensPerChunk - Maximum tokens allowed per chunk.
 * @returns An array of smaller segments.
 */
export function splitLongSegment(
  segment: string,
  tokensPerChunk: number,
): string[] {
  const results: string[] = [];
  let idx = 0;
  while (idx < segment.length) {
    results.push(segment.slice(idx, idx + tokensPerChunk));
    idx += tokensPerChunk;
  }
  return results;
}

/**
 * Splits a text segment (after phonemization) by punctuation so that each group,
 * when tokenized, does not exceed tokensPerChunk.
 * @param text - The phonemized text.
 * @param tokensPerChunk - Maximum tokens allowed per chunk.
 * @returns An array of text parts.
 */
export function splitTextByPunctuation(
  text: string,
  tokensPerChunk: number,
): string[] {
  const result: string[] = [];
  const parts = text.split(/([,.;:!?]+)/g).filter((p) => p.trim() !== "");
  let current = "";
  for (const part of parts) {
    const candidate = current + part;
    if (tokenize(candidate).length <= tokensPerChunk) {
      current = candidate;
    } else {
      if (current) {
        result.push(current);
        current = "";
      }
      if (tokenize(part).length > tokensPerChunk) {
        result.push(...splitLongSegment(part, tokensPerChunk));
      } else {
        current = part;
      }
    }
  }
  if (current) result.push(current);
  return result;
}

/**
 * Preprocesses the raw input text by detecting silence markers before calling the phonemizer.
 * For text segments, it calls the phonemizer and then applies punctuation splitting and token generation.
 * Silence segments return only the duration.
 * @param rawText - Raw input text (may contain markers like "[s2]").
 * @param lang - The language for phonemization.
 * @param tokensPerChunk - Token limit per segment.
 * @returns An array of TextProcessorChunk objects.
 */
export async function preprocessText(
  rawText: string,
  lang: LangId | string,
  tokensPerChunk: number,
): Promise<TextProcessorChunk[]> {
  const chunks: TextProcessorChunk[] = [];
  const segments = splitInputText(rawText);
  for (const seg of segments) {
    if (isSilenceMarker(seg)) {
      const durationSeconds = extractSilenceDuration(seg);
      chunks.push({ type: "silence", durationSeconds });
    } else {
      // Phonemize only the text segment.
      const phonemeText = await apiClient.phonemize(seg, lang);
      const texts = splitTextByPunctuation(phonemeText, tokensPerChunk);
      for (const t of texts) {
        chunks.push({ type: "text", content: t, tokens: tokenize(t) });
      }
    }
  }
  return chunks;
}
