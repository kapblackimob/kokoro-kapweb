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
 * Checks whether a segment is a silence marker.
 * Accepts only the "[number s]" format (e.g. "[1.5s]").
 */
export function isSilenceMarker(segment: string): boolean {
  return /^\[[0-9]+(?:\.[0-9]+)?s\]$/.test(segment.trim());
}

/**
 * Extracts the duration from a silence marker.
 * Accepts only the "[number s]" format.
 *
 * @param marker - The silence marker string.
 * @returns The duration in seconds.
 */
export function extractSilenceDuration(marker: string): number {
  const match = marker.trim().match(/^\[([0-9]+(?:\.[0-9]+)?)s\]$/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Splits the raw input text into segments using silence markers as delimiters.
 *
 * @param rawText - The raw input text.
 * @returns An array of segments.
 */
export function splitInputText(rawText: string): string[] {
  return rawText.split(/(\[[^\]]+\])/g).filter((s) => s.trim() !== "");
}

/**
 * Splits a long segment into smaller parts that do not exceed tokensPerChunk.
 *
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
 * Splits a text segment (after phonemization) by grouping words with their following punctuation.
 * If a group exceeds tokensPerChunk, it is further split.
 *
 * @param text - The phonemized text.
 * @param tokensPerChunk - Maximum tokens allowed per chunk.
 * @returns An array of text parts.
 */
export function splitTextByPunctuation(
  text: string,
  tokensPerChunk: number,
): string[] {
  // Split into parts: words and punctuation tokens.
  const parts = text.split(/([,.;:!?]+)/g).filter((p) => p !== "");
  const groups: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const word = parts[i] || "";
    const punct = parts[i + 1] || "";
    const group = word + punct;
    if (tokenize(group).length > tokensPerChunk) {
      groups.push(...splitLongSegment(group, tokensPerChunk));
    } else {
      groups.push(group);
    }
  }
  return groups;
}

/**
 * Preprocesses the raw input text by detecting silence markers before calling the phonemizer.
 * For text segments, it calls the phonemizer and then applies punctuation splitting and token generation.
 * Silence segments return only the duration.
 *
 * @param rawText - Raw input text (may contain markers like "[1.5s]").
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
