<script lang="ts">
  interface Props {
    lang: string;
    onchange: (voiceWeights: VoiceWeight[]) => void;
  }
  let { lang, onchange }: Props = $props();

  import SelectControl from "$lib/client/components/selectControl.svelte";
  import RangeControl from "$lib/client/components/rangeControl.svelte";
  import { voices, type Voice, type VoiceId } from "$lib/shared/resources";
  import type { VoiceWeight } from "$lib/client/kokoro/combineVoices";

  let mode = $state("simple");

  let simpleSelection = $state("");
  $effect(() => {
    if (mode === "simple") {
      const sv = [
        {
          voiceId: simpleSelection,
          weight: 1,
        },
      ];
      onchange(sv);
    }
  });

  let advancedSelections = $state({});

  let langVoices = $derived(voices.filter((vo) => vo.lang === lang));
  $effect(() => {
    // Every time the lang changes, we reset to the first voice
    // and the simple mode
    advancedSelections = {};
    simpleSelection = langVoices[0].voiceId;
    mode = "simple";
  });
</script>

<div class="voice-picker">
  <!-- Mode Selector -->
  <div class="mode-switch">
    <label>
      <input type="radio" bind:group={mode} value="simple" /> Simple
    </label>
    <label>
      <input type="radio" bind:group={mode} value="advanced" /> Advanced
    </label>
  </div>

  {#if mode === "simple"}
    <!-- Simple Mode: Single voice selector -->
    <SelectControl
      bind:value={simpleSelection}
      title="Select Voice"
      selectClass="w-full"
    >
      {#each langVoices as vo}
        <option value={vo.voiceId}>{vo.name}</option>
      {/each}
    </SelectControl>
  {:else}
    <!-- Advanced Mode: Multiple voice selector with weight adjustments -->
    <div class="advanced-mode">
      {#each langVoices as vo}
        <div class="voice-item flex items-center space-x-2">
          <input type="checkbox" id={vo.voiceId} />
          <label for={vo.voiceId} class="flex-1">{vo.name}</label>
          <!-- {#if vo.enabled}
            <RangeControl
              bind:value={advancedSelections[vo.voiceId]}
              title="Weight"
              min="0"
              max="1"
              step="0.01"
              on:change={(e) => updateWeight(vo.voiceId, e.detail)}
            />
          {/if} -->
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .voice-picker {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 1rem;
  }
  .mode-switch {
    margin-bottom: 1rem;
  }
  .mode-switch label {
    margin-right: 1rem;
  }
  .advanced-mode .voice-item {
    margin-bottom: 0.5rem;
  }
</style>
