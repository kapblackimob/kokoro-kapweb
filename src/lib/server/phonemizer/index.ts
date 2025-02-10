import util from "node:util";
import child_process from "node:child_process";
const exec = util.promisify(child_process.exec);

// https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md
const espeakLangs = {
  us_english: "en-us",
  eu_english: "en-gb",
  la_spanish: "es-419",
  eu_spanish: "es",
};

const langs = {
  "a": espeakLangs.us_english,
  "en": espeakLangs.us_english,
  "en-us": espeakLangs.us_english,
  "b": espeakLangs.eu_english,
  "en-gb": espeakLangs.eu_english,
  "en-uk": espeakLangs.eu_english,
  "e": espeakLangs.la_spanish,
  "es": espeakLangs.la_spanish,
  "es-la": espeakLangs.la_spanish,
  "es-es": espeakLangs.eu_spanish,
};

export type Lang = keyof typeof langs;

/**
 * phonemize converts text to phonemes and returns
 * the phonemized text in the specified language.
 *
 * it uses python phonemizer and espeak-ng backend
 * to generate the phonemes.
 *
 * https://bootphon.github.io/phonemizer/cli.html
 *
 * @param text
 * @param lang
 * @returns
 */
export async function phonemize(text: string, lang: Lang): Promise<string> {
  const langCode = langs[lang] ?? espeakLangs.us_english;
  text = normalizeText(text);
  text = text.replaceAll('"', '\\"');

  const cmd = `
    echo "${text}" | \
    /usr/local/bin/phonemize \
    --quiet \
    --preserve-punctuation \
    --with-stress \
    --backend espeak \
    --language ${langCode}
  `;

  const { stdout, stderr } = await exec(cmd);
  if (stderr) throw new Error(stderr);

  return stdout.split("\n").join(" ").trim();
}

/**
 * normalizeText normalizes text to be phonemized.
 *
 * @param text The text to normalize.
 */
function normalizeText(text: string): string {
  return (
    text
      // Quotes and parentheses
      .replaceAll("‘", "'")
      .replaceAll("’", "'")
      .replaceAll("«", "(")
      .replaceAll("»", ")")
      .replaceAll("“", '"')
      .replaceAll("”", '"')
      // Punctuation
      .replace(/、/g, ", ")
      .replace(/。/g, ". ")
      .replace(/！/g, "! ")
      .replace(/，/g, ", ")
      .replace(/：/g, ": ")
      .replace(/；/g, "; ")
      .replace(/？/g, "? ")
      // Spaces
      .replaceAll("\n", "  ")
      .replaceAll("\t", "  ")
      .trim()
  );
}
