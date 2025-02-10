import { voices } from "./voices";

export interface Lang {
  // This value is a language identifier from the model list.
  langId: LangId;

  // This value is the human-readable name of the language.
  name: string;

  // This value should match an espeak-ng language code.
  // https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md
  espeakLang: string;
}

export type LangId = (typeof langsIds)[number];

export const langsIds = [...new Set(voices.map((voice) => voice.lang))];

export const langs: Lang[] = [...langsIds].map((lang) => {
  switch (lang) {
    case "en-us":
      return {
        langId: "en-us",
        name: "English (US)",
        espeakLang: "en-us",
      };
    case "en-gb":
      return {
        langId: "en-gb",
        name: "English (UK)",
        espeakLang: "en-gb",
      };
    case "ja":
      return {
        langId: "ja",
        name: "Japanese",
        espeakLang: "ja",
      };
    case "zh":
      return {
        langId: "zh",
        name: "Chinese",
        espeakLang: "cmn",
      };
    case "es":
      return {
        langId: "es",
        name: "Spanish",
        espeakLang: "es-419",
      };
    case "hi":
      return {
        langId: "hi",
        name: "Hindi",
        espeakLang: "hi",
      };
    case "it":
      return {
        langId: "it",
        name: "Italian",
        espeakLang: "it",
      };
    case "pt-br":
      return {
        langId: "pt-br",
        name: "Portuguese (Brazil)",
        espeakLang: "pt-br",
      };
    default: {
      const _exhaustiveCheck: never = lang;
      return _exhaustiveCheck;
    }
  }
});

export const langsMap: Record<LangId, Lang> = (() => {
  const map: Record<LangId, Lang> = {} as Record<LangId, Lang>;
  for (const lang of langs) {
    map[lang.langId] = lang;
  }
  return map;
})();
