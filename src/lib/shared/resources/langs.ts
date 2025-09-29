export type Lang = (typeof langs)[number];
export type LangId = Lang["id"];

// The id of langs should match an espeak-ng language code.
// https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md
export const langs = [
  {
    id: "en-us",
    name: "English (US)",
    nativeName: "English (US)",
  },
  {
    id: "en-gb",
    name: "English (UK)",
    nativeName: "English (UK)",
  },
  {
    id: "pt-br",
    name: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
  },
  {
    id: "fo-st",
    name: "Forro (Sao Tome and Principe)",
    nativeName: "Fô d'Ambô (STP)",
  },
  {
    id: "es-419",
    name: "Spanish (Latin America)",
    nativeName: "Español (Latinoamérica)",
  },
  {
    id: "es",
    name: "Spanish (Spain)",
    nativeName: "Español (España)",
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
  },
  {
    id: "de",
    name: "German",
    nativeName: "Deutsch",
  },
  {
    id: "it",
    name: "Italian",
    nativeName: "Italiano",
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語",
  },
  {
    id: "cmn",
    name: "Chinese (Mandarin)",
    nativeName: "中文 (普通话)",
  },
  {
    id: "ko",
    name: "Korean",
    nativeName: "한국어",
  },
  {
    id: "ru",
    name: "Russian",
    nativeName: "Русский",
  },
  {
    id: "ar",
    name: "Arabic",
    nativeName: "العربية",
  },
  {
    id: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
  {
    id: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
  },
  {
    id: "pl",
    name: "Polish",
    nativeName: "Polski",
  },
  {
    id: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
  },
] as const;

export const langsMap: Record<LangId, Lang> = (() => {
  const map: Record<LangId, Lang> = {} as Record<LangId, Lang>;
  for (const lang of langs) {
    map[lang.id] = lang;
  }
  return map;
})();

export const langsIds = langs.map((lang) => lang.id);

// Helper function to get language by ID with fallback
export const getLangById = (id: string): Lang => {
  return langsMap[id as LangId] || langsMap["en-us"];
};

// Helper function to detect browser language and map to closest supported language
export const detectBrowserLanguage = (): LangId => {
  if (typeof window === "undefined") return "en-us";
  
  const browserLang = navigator.language.toLowerCase();
  
  // Exact match
  if (langsMap[browserLang as LangId]) {
    return browserLang as LangId;
  }
  
  // Match by language code (e.g., 'pt' -> 'pt-br')
  const langCode = browserLang.split("-")[0];
  for (const lang of langs) {
    if (lang.id.startsWith(langCode)) {
      return lang.id;
    }
  }
  
  // Default to English (US)
  return "en-us";
};
