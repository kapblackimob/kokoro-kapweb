import type { LangId } from "$lib/shared/resources";

/**
 * Sends a request to the phonemizer API to get the phonemes of a text.
 *
 * @param text The text to phonemize.
 * @param lang The language of the text.
 */
export async function phonemize(
  text: string,
  lang: LangId | string,
): Promise<string> {
  const res = await fetch("/api/phonemizer", {
    method: "POST",
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) throw new Error(`Error fetching phonemes: ${res.statusText}`);

  const json = await res.json();
  if (json.phonemes === undefined || json.phonemes === null) {
    throw new Error("No phonemes returned");
  }

  return json.phonemes;
}
