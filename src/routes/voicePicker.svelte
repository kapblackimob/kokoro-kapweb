<script lang="ts">
  interface Props {
    lang: string;
    onchange: (voiceWeights: VoiceWeight[]) => void;
  }
  let { lang, onchange }: Props = $props();

  import { adjustVoiceWeights } from "$lib/client/utils/adjustVoiceWeights";
  import SelectControl from "$lib/client/components/selectControl.svelte";
  import RangeControl from "$lib/client/components/rangeControl.svelte";
  import { voices, type VoiceId } from "$lib/shared/resources";
  import type { VoiceWeight } from "$lib/shared/kokoro/combineVoices";

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
  let langVoices = $derived(voices.filter((vo) => vo.lang.id === lang));

  // Reset selections when the language changes.
  $effect(() => {
    advancedSelections = {};
    simpleSelection = langVoices[0]?.id ?? "";
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

  // Toggle a voice in advanced mode: add with weight 0 (disabled) or remove it.
  function toggleVoice(voiceId: VoiceId | string) {
    const isActive = advancedSelections[voiceId] !== undefined;
    if (!isActive) {
      advancedSelections = { ...advancedSelections, [voiceId]: 0 };
    } else {
      const { [voiceId]: removed, ...rest } = advancedSelections;
      advancedSelections = rest;
    }
  }

  // Update the weight of a voice and adjust others if necessary.
  function updateVoiceWeight(voiceId: string, newWeight: number) {
    advancedSelections = adjustVoiceWeights(
      advancedSelections,
      voiceId,
      newWeight,
    );
  }
</script>

<div>
  <div class="flex items-center justify-between">
    <span class="text-xs font-semibold">Voice (quality)</span>

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
    <SelectControl bind:value={simpleSelection} selectClass="w-full mt-[6px]">
      {#each langVoices as vo}
        <option value={vo.id}>{vo.name} ({vo.overallGrade})</option>
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
              checked={advancedSelections[vo.id] !== undefined}
              class="checkbox"
              onclick={() => toggleVoice(vo.id)}
            />
            <span>{vo.name} ({vo.overallGrade})</span>
          </label>

          <RangeControl
            value={advancedSelections[vo.id] ?? 0}
            disabled={advancedSelections[vo.id] === undefined}
            title={advancedSelections[vo.id]
              ? `Weight ${Math.round(advancedSelections[vo.id] * 100)}%`
              : "Weight"}
            hideValue={true}
            min="0"
            max="1"
            step="0.1"
            oninput={(newValue) =>
              updateVoiceWeight(vo.id, parseFloat(newValue))}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>
