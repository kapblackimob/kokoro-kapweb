<script lang="ts">
  import { onMount } from "svelte";
  import * as wavefile from "wavefile";
  import { generateVoice } from "$lib/shared/kokoro";
  import type { VoiceWeight } from "$lib/shared/kokoro";
  import { detectWebGPU } from "$lib/client/utils";
  import { langs, langsMap, models, modelsMap } from "$lib/shared/resources";
  import SelectControl from "$lib/client/components/selectControl.svelte";
  import TextareaControl from "$lib/client/components/textareaControl.svelte";
  import RangeControl from "$lib/client/components/rangeControl.svelte";
  import VoicePicker from "./voicePicker.svelte";
  import GenerateButton from "./generateButton.svelte";
  import { toaster } from "$lib/client/toaster";

  let text = $state("Sometimes you win, sometimes you learn.");
  let lang = $state(langsMap["en-us"].id);
  let voices = $state([] as VoiceWeight[]);
  let model = $state(modelsMap.model.id);
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
  let voiceUrl = $state("");
  const process = async () => {
    if (loading) return;
    if (!text) return;

    loading = true;
    try {
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

      toaster.success("Audio generated successfully");
    } catch (error) {
      console.error(error);
      toaster.error((error as any).message ?? "An error occurred, see console");
    } finally {
      loading = false;
    }
  };
</script>

<div class="space-y-4">
  <h2 class="text-xl font-bold">Input</h2>

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
        <option value={mo.id}>
          {mo.size} - {mo.id} ({mo.quantization})
        </option>
      {/each}
    </SelectControl>

    <SelectControl
      bind:value={lang}
      title="Language (region)"
      selectClass="w-full"
    >
      {#each langs as lng}
        <option value={lng.id}>{lng.name}</option>
      {/each}
    </SelectControl>

    <VoicePicker {lang} onchange={(vws) => (voices = vws)} />
  </div>

  <TextareaControl
    bind:value={text}
    title="Text to process"
    textareaClass="w-full"
  />

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <RangeControl
      bind:value={speed}
      hideValue={true}
      title={`Speed ${speed}x`}
      inputClass="w-full max-w-[400px]"
      min="0.1"
      max="2"
      step="0.1"
    />

    <GenerateButton {loading} onclick={() => process()} />
  </div>

  <div class="space-y-4 pt-2">
    <h2 class="text-xl font-bold">Output</h2>

    <audio class="w-full" src={voiceUrl} controls></audio>
  </div>
</div>
