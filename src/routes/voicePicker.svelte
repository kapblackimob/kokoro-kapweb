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

  // Component mode: "simple" for a single selection, "advanced" for multiple with weights.
  let mode = $state("simple");
  function toggleMode() {
    mode = mode === "simple" ? "advanced" : "simple";
  }

  // Simple mode selection: a single voice (weight always 1)
  let simpleSelection = $state("");
  $effect(() => {
    if (mode === "simple") {
      onchange([{ voiceId: simpleSelection, weight: 1 }]);
    }
  });

  // Advanced mode selections: mapping voiceId to its weight.
  let advancedSelections = $state<Record<string, number>>({});

  // Filter voices by the selected language.
  let langVoices = $derived(voices.filter((vo) => vo.lang === lang));

  // Reset selections when the language changes.
  $effect(() => {
    advancedSelections = {};
    simpleSelection = langVoices[0]?.voiceId ?? "";
    mode = "simple";
  });

  // Update onchange callback when in advanced mode.
  $effect(() => {
    if (mode === "advanced") {
      const selections: VoiceWeight[] = Object.entries(advancedSelections).map(
        ([voiceId, weight]) => ({ voiceId, weight }),
      );
      onchange(selections);
    }
  });

  // Toggle a voice in advanced mode.
  function toggleVoice(voiceId: VoiceId | string) {
    const checked = advancedSelections[voiceId] === undefined;

    if (checked) {
      // Add voice with a default weight of 0.5.
      if (advancedSelections[voiceId] === undefined) {
        advancedSelections = { ...advancedSelections, [voiceId]: 0.5 };
      }
    } else {
      // Remove voice from selections.
      const { [voiceId]: removed, ...rest } = advancedSelections;
      advancedSelections = rest;
    }
  }
</script>

<div>
  <div class="flex items-center justify-between">
    <span class="text-xs font-semibold">Voice</span>

    <label class="flex items-center space-x-2">
      <input
        type="checkbox"
        class="toggle"
        checked={mode == "advanced"}
        onclick={toggleMode}
      />
      <span>Advanced Mode</span>
    </label>
  </div>

  {#if mode === "simple"}
    <SelectControl bind:value={simpleSelection} selectClass="w-full mt-[5px]">
      {#each langVoices as vo}
        <option value={vo.voiceId}>{vo.name}</option>
      {/each}
    </SelectControl>
  {:else}
    <div
      class="rounded-box border-base-content/20 mt-[10px] grid grid-cols-1 space-y-2 border p-4 md:grid-cols-2 md:gap-2"
    >
      {#each langVoices as vo}
        <div>
          <label class="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={advancedSelections[vo.voiceId] !== undefined}
              class="checkbox"
              onclick={() => toggleVoice(vo.voiceId)}
            />
            <span>
              {vo.name}
            </span>
          </label>

          <RangeControl
            bind:value={advancedSelections[vo.voiceId]}
            disabled={advancedSelections[vo.voiceId] === undefined}
            title={advancedSelections[vo.voiceId]
              ? `Weight ${advancedSelections[vo.voiceId] * 100}%`
              : "Weight"}
            hideValue={true}
            min="0"
            max="1"
            step="0.1"
          />
        </div>
      {/each}
    </div>
  {/if}
</div>
