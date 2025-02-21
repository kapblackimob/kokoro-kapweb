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
  import SelectControl from "$lib/client/components/SelectControl.svelte";
  import TextareaControl from "$lib/client/components/TextareaControl.svelte";
  import RangeControl from "$lib/client/components/RangeControl.svelte";
  import { toaster } from "$lib/client/toaster";
  import VoicePicker from "./VoicePicker.svelte";
  import GenerateButton from "./GenerateButton.svelte";
  import ProfileManager from "./ProfileManager.svelte";
  import ExecutionPlacePicker from "./ExecutionPlacePicker.svelte";
  import { profile } from "./store.svelte";

  // let text = $state("Sometimes you win, sometimes you learn.");
  // let lang = $state(langsMap["en-us"].id);
  // let voiceFormula = $state("");
  // let model = $state(modelsMap.model.id);
  // let speed = $state(1);
  // let format = $state("mp3" as "wav" | "mp3");
  // let acceleration = $state("cpu" as "cpu" | "webgpu");
  // let executionPlace = $state("browser" as "browser" | "api");

  let webgpuSupported = $state(false);
  onMount(async () => {
    webgpuSupported = await detectWebGPU();
  });

  let loading = $state(false);
  let voiceUrl = $state("");
  const process = async () => {
    if (loading) return;
    if (!profile.text) return;

    loading = true;
    try {
      const result = await generateVoice({
        text: profile.text,
        lang: profile.lang,
        voiceFormula: profile.voiceFormula,
        model: profile.model,
        speed: profile.speed,
        format: profile.format,
        acceleration: profile.acceleration,
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
</script>

<div class="space-y-4">
  <h2 class="text-xl font-bold">Input</h2>

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <ProfileManager />
    <ExecutionPlacePicker />

    <SelectControl
      bind:value={profile.acceleration}
      disabled={profile.executionPlace === "api"}
      title="Acceleration"
      selectClass="w-full"
    >
      <option value="cpu">CPU</option>
      {#if webgpuSupported}
        <option value="webgpu">WebGPU (Faster)</option>
      {:else}
        <option disabled>WebGPU (not supported by your browser)</option>
      {/if}
    </SelectControl>

    <SelectControl
      bind:value={profile.model}
      title="Model quantization"
      selectClass="w-full"
    >
      {#each models as mo}
        <option value={mo.id}>
          {mo.size} - {mo.id} ({mo.quantization})
        </option>
      {/each}
    </SelectControl>

    <SelectControl
      bind:value={profile.lang}
      title="Language accent (region)"
      selectClass="w-full"
    >
      {#each langs as lng}
        <option value={lng.id}>{lng.name}</option>
      {/each}
    </SelectControl>

    <VoicePicker />
  </div>

  <TextareaControl
    bind:value={profile.text}
    title="Text to process"
    textareaClass="w-full"
  />

  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <RangeControl
      bind:value={profile.speed}
      hideValue={true}
      title={`Speed ${profile.speed}x`}
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
