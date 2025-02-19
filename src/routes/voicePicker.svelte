<script lang="ts">
  interface Props {
    lang: string;
    onchange: (voiceFormula: string) => void;
  }
  let { lang, onchange }: Props = $props();

  import VoicePickerSimple from "./voicePickerSimple.svelte";
  import VoicePickerAdvanced from "./voicePickerAdvanced.svelte";
  import { voicesByLang, type LangId } from "$lib/shared/resources";

  // Component mode: "simple" for a single selection, "advanced" for multiple with weights.
  let mode = $state("simple");
  function toggleMode() {
    mode = mode === "simple" ? "advanced" : "simple";
  }

  let orderedVoices = $derived.by(() => {
    let langVoices = voicesByLang[lang as LangId];
    let combinedVoices = [langVoices];

    let otherVoices = { ...voicesByLang };
    delete otherVoices[lang as LangId];

    for (let voices of Object.values(otherVoices)) {
      combinedVoices.push(voices);
    }

    return combinedVoices;
  });
</script>

<div>
  <div class="flex items-end justify-between">
    <span class="text-xs font-semibold">
      {mode === "simple" ? "Voice (quality)" : "Voice formula"}
    </span>

    <label class="flex items-center space-x-2">
      <input
        type="checkbox"
        class="toggle toggle-sm"
        checked={mode == "advanced"}
        onclick={toggleMode}
      />
      <span>Advanced Mode</span>
    </label>
  </div>

  {#if mode === "simple"}
    <VoicePickerSimple {lang} {onchange} />
  {:else}
    <VoicePickerAdvanced {orderedVoices} {onchange} />
  {/if}
</div>
