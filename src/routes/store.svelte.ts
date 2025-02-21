import { detectWebGPU } from "$lib/client/utils";
import {
  langsMap,
  modelsMap,
  voicesMap,
  type LangId,
  type ModelId,
} from "$lib/shared/resources";

export interface ProfileData {
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

export const defaultProfile: ProfileData = {
  text: "Sometimes you win, sometimes you learn.",
  lang: voicesMap["af_alloy"].lang.id,
  voiceMode: "simple",
  voiceFormula: voicesMap["af_alloy"].id,
  model: modelsMap.model.id,
  speed: 1,
  format: "mp3",
  acceleration: (await detectWebGPU()) ? "webgpu" : "cpu",
  executionPlace: "browser",
  apiBaseUrl: "/api/v1/audio/speech",
  apiKey: "",
};

export const profile: ProfileData = $state({ ...defaultProfile });

export const loadProfile = (newProfile: ProfileData) => {
  const keys = Object.keys(newProfile);
  for (const key of keys) {
    // @ts-ignore
    profile[key] = newProfile[key];
  }
};
