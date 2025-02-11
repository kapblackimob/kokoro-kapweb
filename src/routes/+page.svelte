<script lang="ts">
  import { onMount } from "svelte";
  import * as wavefile from "wavefile";
  import { apiClient } from "$lib/client/apiClient";
  import { generateVoice } from "$lib/client/kokoro";
  import { tokenize } from "$lib/client/kokoro/tokenizer";
  import { detectWebGPU } from "$lib/client/utils";
  import { langs, langsMap, models, modelsMap } from "$lib/shared/resources";
  import SelectControl from "$lib/client/components/selectControl.svelte";
  import TextareaControl from "$lib/client/components/textareaControl.svelte";
  import RangeControl from "$lib/client/components/rangeControl.svelte";
  import VoicePicker from "./voicePicker.svelte";
  import type { VoiceWeight } from "$lib/client/kokoro/combineVoices";

  let text = $state("Sometimes you win, sometimes you learn.");
  let lang = $state(langsMap["en-us"].langId);
  let voices = $state([] as VoiceWeight[]);
  let model = $state(modelsMap.model.modelId);
  let speed = $state(1);
  let webgpu = $state(false);

  let webgpuSupported = $state(false);
  let webgpuHelpText = $state("This will use the CPU to run the model.");
  onMount(async () => {
    webgpuSupported = await detectWebGPU();
    webgpu = webgpuSupported;
  });
  $effect(() => {
    if (webgpu) {
      webgpuHelpText =
        "WebGPU is faster but may not work as expected, try different models, languages and voices.";
      return;
    }
    webgpuHelpText = "This will use the CPU to run the model.";
  });

  let loading = $state(false);
  let phonemes = $state("");
  let tokens = $state([] as number[]);
  let voiceUrl = $state("");

  const process = async () => {
    loading = true;
    try {
      phonemes = await apiClient.phonemize(text, "en");
      tokens = tokenize(text);

      const waveform = await generateVoice({
        text: text,
        lang: lang,
        voices: voices,
        model: model,
        speed: speed,
        webgpu: webgpu,
      });

      console.log("Result waveform: ", waveform);

      let wav = new wavefile.WaveFile();
      wav.fromScratch(1, 24000, "32f", waveform);
      const wavBuffer = wav.toBuffer();
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(wavBlob);
      voiceUrl = url;
    } catch (error) {
      console.error(error);
      alert((error as any).message ?? "An error occurred, see console.");
    } finally {
      loading = false;
    }
  };
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
  <SelectControl
    bind:value={webgpu}
    title="Acceleration"
    helpText={webgpuHelpText}
    selectClass="w-full"
  >
    <option value={false}>CPU</option>
    {#if webgpuSupported}
      <option value={true}>WebGPU</option>
    {:else}
      <option disabled>WebGPU (not supported by your browser)</option>
    {/if}
  </SelectControl>

  <SelectControl bind:value={model} title="Model" selectClass="w-full">
    {#each models as mo}
      <option value={mo.modelId}>
        {mo.size} - {mo.modelId} ({mo.quantization})
      </option>
    {/each}
  </SelectControl>

  <SelectControl bind:value={lang} title="Language" selectClass="w-full">
    {#each langs as lng}
      <option value={lng.langId}>{lng.name}</option>
    {/each}
  </SelectControl>

  <VoicePicker {lang} onchange={(vws) => (voices = vws)} />
</div>

<TextareaControl
  bind:value={text}
  title="Text to process"
  textareaClass="w-full"
/>

<div class="flex flex-col items-end space-y-4">
  <div class="w-full max-w-[300px]">
    <RangeControl
      bind:value={speed}
      hideValue={true}
      title={`Speed ${speed}x`}
      min="0.1"
      max="2"
      step="0.1"
    />
  </div>
  <button
    class="btn btn-primary btn-lg"
    onclick={() => process()}
    disabled={loading}
  >
    Generate Voice
  </button>
</div>

{#if phonemes}
  <TextareaControl bind:value={phonemes} title="Phonemes" />
{/if}
{#if phonemes}
  <TextareaControl bind:value={tokens} title="Tokens" />
{/if}

{#if voiceUrl && !loading}
  <audio class="w-full" src={voiceUrl} controls></audio>
{/if}
