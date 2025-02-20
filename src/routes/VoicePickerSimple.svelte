<script lang="ts">
  interface Props {
    lang: string;
    onchange: (voiceFormula: string) => void;
  }
  let { lang, onchange }: Props = $props();

  import { voicesByLang, type LangId } from "$lib/shared/resources";
  import SelectControl from "$lib/client/components/SelectControl.svelte";

  // Order voices by language, with the selected language first.
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

  let value = $state("");
  $effect(() => onchange(value));

  // Every time the selected language changes, select the first voice.
  $effect(() => {
    let firstVoice = orderedVoices[0][0];
    value = firstVoice.id;
  });
</script>

<SelectControl bind:value selectClass="w-full mt-[6px]">
  {#each orderedVoices as voicesArr}
    <optgroup label={voicesArr[0].lang.name}>
      {#each voicesArr as vo}
        <option value={vo.id}>{vo.name} ({vo.overallGrade})</option>
      {/each}
    </optgroup>
  {/each}
</SelectControl>
