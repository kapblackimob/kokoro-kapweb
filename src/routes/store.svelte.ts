import { browser } from "$app/environment";
import { detectWebGPU } from "$lib/client/utils";
import {
  getRandomQuote,
  modelsMap,
  voicesMap,
  voicesByLang,
  type LangId,
  type ModelId,
  type VoiceId,
  detectBrowserLanguage,
} from "$lib/shared/resources";

export interface ProfileData {
  name: string;
  text: string;
  lang: LangId;
  voiceMode: "simple" | "advanced";
  voiceFormula: string;
  model: ModelId;
  speed: number;
  format: "mp3" | "wav";
  acceleration: "cpu" | "webgpu";
  executionPlace: "browser" | "api";
  apiBaseUrl: string;
  apiKey: string;
}

function getCurrentHost() {
  if (!browser) return "";
  return `${window.location.protocol}//${window.location.host}`;
}

// Obtém a primeira voz disponível para um idioma
function getDefaultVoiceForLanguage(lang: LangId): VoiceId {
  const voices = voicesByLang[lang];
  if (voices && voices.length > 0) {
    // Prioriza vozes com melhor qualidade
    const sortedVoices = [...voices].sort((a, b) => {
      const gradeOrder = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F+", "F"];
      const aIndex = gradeOrder.indexOf(a.overallGrade);
      const bIndex = gradeOrder.indexOf(b.overallGrade);
      return aIndex - bIndex;
    });
    return sortedVoices[0].id;
  }
  // Fallback para uma voz inglesa
  return "af_alloy";
}

// Detectar idioma do navegador
const detectedLang = browser ? detectBrowserLanguage() : ("en-us" as LangId);

export const defaultProfile: ProfileData = {
  name: "default",
  text: getRandomQuote(),
  lang: detectedLang,
  voiceMode: "simple",
  voiceFormula: getDefaultVoiceForLanguage(detectedLang),
  model: modelsMap.model.id,
  speed: 1,
  format: "mp3",
  acceleration: detectWebGPU() ? "webgpu" : "cpu",
  executionPlace: "browser",
  apiBaseUrl: `${getCurrentHost()}/api/v1`,
  apiKey: "",
};

export const profile: ProfileData = $state({
  ...defaultProfile,
});

export const loadProfile = (newProfile: ProfileData) => {
  const keys = Object.keys(newProfile);
  for (const key of keys) {
    // @ts-ignore
    profile[key] = newProfile[key];
  }
};

// Função para trocar idioma e ajustar voz automaticamente
export const changeLanguage = (lang: LangId) => {
  profile.lang = lang;
  
  // Verifica se a voz atual é compatível com o novo idioma
  const currentVoice = voicesMap[profile.voiceFormula as VoiceId];
  if (!currentVoice || currentVoice.lang.id !== lang) {
    // Se não for compatível, seleciona a melhor voz para o idioma
    profile.voiceFormula = getDefaultVoiceForLanguage(lang);
  }
};

// Função para obter vozes disponíveis para um idioma
export const getVoicesForLanguage = (lang: LangId) => {
  return voicesByLang[lang] || [];
};

// Função para validar se uma voz é compatível com o idioma
export const isVoiceCompatibleWithLanguage = (voiceId: VoiceId, lang: LangId): boolean => {
  const voice = voicesMap[voiceId];
  return voice ? voice.lang.id === lang : false;
};
