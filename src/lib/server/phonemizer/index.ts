import util from "node:util";
import child_process from "node:child_process";
const exec = util.promisify(child_process.exec);

// https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md
const espeakLangs = {
  us_english: "en-us",
  eu_english: "en",
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
 * phonemize converts text to phonemes using espeak-ng and returns
 * the phonemized text in the specified language.
 *
 * @param text
 * @param lang
 * @returns
 */
export async function phonemize(text: string, lang: Lang): Promise<string> {
  const langCode = langs[lang] ?? espeakLangs.us_english;

  text = text.replaceAll('"', '\\"');
  const cmdParts = [
    "espeak-ng",
    "-q",
    "--ipa",
    "-v",
    langCode,
    `"${text}"`,
  ];

  const { stdout, stderr } = await exec(cmdParts.join(" "));
  if (stderr) throw new Error(stderr);

  return stdout.split("\n").join(" ").trim();
}
