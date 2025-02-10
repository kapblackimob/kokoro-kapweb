import { voices } from "./voices";

export interface Lang {
  // This value is a language identifier from the model list.
  id: LangId;

  // This value is the human-readable name of the language.
  name: string;

  // This value should match an espeak-ng language code.
  // https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md
  espeakLang: string;
}

export type LangId = (typeof langsIds)[number];

export const langsIds = voices.map((voice) => voice.language);

export const langs: Lang[] = [...langsIds].map((lang) => {
  switch (lang) {
    case "en-us":
      return {
        id: "en-us",
        name: "English (US)",
        espeakLang: "en-us",
      };
    case "en-gb":
      return {
        id: "en-gb",
        name: "English (UK)",
        espeakLang: "en-gb",
      };
    case "ja":
      return {
        id: "ja",
        name: "Japanese",
        espeakLang: "ja",
      };
    case "zh":
      return {
        id: "zh",
        name: "Chinese",
        espeakLang: "cmn",
      };
    case "es":
      return {
        id: "es",
        name: "Spanish",
        espeakLang: "es-419",
      };
    case "hi":
      return {
        id: "hi",
        name: "Hindi",
        espeakLang: "hi",
      };
    case "it":
      return {
        id: "it",
        name: "Italian",
        espeakLang: "it",
      };
    case "pt-br":
      return {
        id: "pt-br",
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
    map[lang.id] = lang;
  }
  return map;
})();
