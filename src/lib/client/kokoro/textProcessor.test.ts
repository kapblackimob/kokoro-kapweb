import { describe, it, expect, vi } from "vitest";
import {
  isSilenceMarker,
  extractSilenceDuration,
  splitInputText,
  splitLongSegment,
  splitTextByPunctuation,
  preprocessText,
  type TextProcessorChunk,
} from "./textProcessor";

// Stub tokenize for testing purposes
vi.mock("./tokenizer", () => ({
  tokenize: (text: string) => text.split("").map((c) => c.charCodeAt(0)),
}));

// Stub apiClient.phonemize so we can test preprocessText
vi.mock("$lib/client/apiClient", () => ({
  apiClient: {
    phonemize: async (text: string, _: string) => text,
  },
}));

describe("isSilenceMarker", () => {
  it("should detect marker in format [1.5s]", () => {
    expect(isSilenceMarker("[1.5s]")).toBe(true);
  });
  it("should return false for non-marker text", () => {
    expect(isSilenceMarker("[s1.5]")).toBe(false);
    expect(isSilenceMarker("hello")).toBe(false);
    expect(isSilenceMarker("[]")).toBe(false);
    expect(isSilenceMarker("[1]")).toBe(false);
    expect(isSilenceMarker("[1.5]")).toBe(false);
    expect(isSilenceMarker("[hello]")).toBe(false);
  });
});

describe("extractSilenceDuration", () => {
  it("should extract duration from [2s] correctly", () => {
    expect(extractSilenceDuration("[2s]")).toBe(2);
  });
  it("should extract duration with decimals", () => {
    expect(extractSilenceDuration("[1.75s]")).toBe(1.75);
  });
});

describe("splitInputText", () => {
  it("should split text with silence markers", () => {
    const input = "Sometimes you win [1.5s] sometimes you learn.";
    const segments = splitInputText(input);
    expect(segments).toEqual([
      "Sometimes you win ",
      "[1.5s]",
      " sometimes you learn.",
    ]);
  });
});

describe("splitLongSegment", () => {
  it("should split a long string into chunks", () => {
    const seg = "abcdefghij";
    const parts = splitLongSegment(seg, 3);
    expect(parts).toEqual(["abc", "def", "ghi", "j"]);
  });
});

describe("splitTextByPunctuation", () => {
  it("should split text by punctuation without exceeding token count", () => {
    const text = "Hello, world! This is a test.";
    const parts = splitTextByPunctuation(text, 1000);
    expect(parts).toEqual(["Hello,", " world!", " This is a test."]);
  });
});

describe("preprocessText", () => {
  it("should process text with a silence marker correctly", async () => {
    const input = "Test [1.5s] test";
    const chunks: TextProcessorChunk[] = await preprocessText(
      input,
      "en",
      1000,
    );

    // Expect first chunk to be a text chunk, then a silence chunk, then a text chunk.
    expect(chunks).toHaveLength(3);
    expect(chunks[0].type).toBe("text");
    expect(chunks[1].type).toBe("silence");
    expect(chunks[2].type).toBe("text");

    // Check silence duration extraction
    if (chunks[1].type === "silence") {
      expect(chunks[1].durationSeconds).toBe(1.5);
    }
  });

  it("should process text separating silences, punctuation and long segments", async () => {
    const input =
      "Hello, world! This is a looonnng test. [1.5s] Test test test.";
    const chunks: TextProcessorChunk[] = await preprocessText(input, "en", 7);
    expect(chunks).toHaveLength(11);
    expect(chunks.map((c) => c.type)).toEqual([
      "text",
      "text",
      "text",
      "text",
      "text",
      "text",
      "text",
      "silence",
      "text",
      "text",
      "text",
    ]);
  });
});
