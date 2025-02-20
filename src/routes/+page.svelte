<script lang="ts">
  import { onMount } from "svelte";
  import { generateVoice } from "$lib/shared/kokoro";
  import { detectWebGPU } from "$lib/client/utils";
  import {
    langs,
    langsMap,
    models,
    modelsMap,
    type LangId,
    type ModelId,
  } from "$lib/shared/resources";
  import SelectControl from "$lib/client/components/selectControl.svelte";
  import TextareaControl from "$lib/client/components/textareaControl.svelte";
  import RangeControl from "$lib/client/components/rangeControl.svelte";
  import VoicePicker from "./voicePicker.svelte";
  import GenerateButton from "./generateButton.svelte";
  import { toaster } from "$lib/client/toaster";
  import ProfileManager from "./ProfileManager.svelte";

  let text = $state("Sometimes you win, sometimes you learn.");
  let lang = $state(langsMap["en-us"].id);
  let voiceFormula = $state("");
  let model = $state(modelsMap.model.id);
  let speed = $state(1);
  let format = $state("mp3" as "wav" | "mp3");
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
      const result = await generateVoice({
        text: text,
        lang: lang,
        voiceFormula: voiceFormula,
        model: model,
        speed: speed,
        format: format,
        webgpu: webgpu,
      });

      const wavBlob = new Blob([result.buffer], { type: result.mimeType });
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

  function handleProfileChange(settings: {
    text: string;
    lang: LangId;
    voiceFormula: string;
    model: ModelId;
    speed: number;
    format: "mp3" | "wav";
  }) {
    text = settings.text;
    lang = settings.lang;
    voiceFormula = settings.voiceFormula;
    model = settings.model;
    speed = settings.speed;
    format = settings.format;
  }
</script>

<div class="space-y-4">
  <div>
    <h2 class="text-xl font-bold">Profile</h2>
    <p>
      Profiles are saved settings that can be loaded later, they are stored in
      your browser.
    </p>
  </div>

  <ProfileManager
    currentSettings={{ text, lang, voiceFormula, model, speed, format }}
    onChange={handleProfileChange}
  />

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
      title="Language accent (region)"
      selectClass="w-full"
    >
      {#each langs as lng}
        <option value={lng.id}>{lng.name}</option>
      {/each}
    </SelectControl>

    <VoicePicker
      {lang}
      onchange={(newVoiceFormula) => (voiceFormula = newVoiceFormula)}
    />
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
