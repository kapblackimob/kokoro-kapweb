<script lang="ts">
  import { onMount } from "svelte";
  import * as wavefile from "wavefile";
  import { apiClient } from "$lib/client/apiClient";
  import { generateVoice } from "$lib/client/kokoro";
  import { tokenize } from "$lib/client/kokoro/tokenizer";
  import { detectWebGPU } from "$lib/client/utils";
  import {
    langs,
    langsMap,
    models,
    modelsMap,
    voices,
    voicesMap,
  } from "$lib/shared/resources";

  let text = $state("Sometimes you win, sometimes you learn.");
  let lang = $state(langsMap["en-us"].langId);
  let voice = $state(voicesMap.af_alloy.voiceId);
  let model = $state(modelsMap.model.modelId);
  let speed = $state(1);
  let webgpu = $state(false);

  let langVoices = $derived(voices.filter((vo) => vo.lang === lang));
  $effect(() => {
    voice = langVoices[0].voiceId;
  });

  let webgpuSupported = $state(false);
  onMount(async () => {
    webgpuSupported = await detectWebGPU();
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
        voice: voice,
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

<select bind:value={webgpu}>
  <option value={false}>CPU</option>
  <option value={true}>WebGPU</option>
</select>
<br />
<select bind:value={lang}>
  {#each langs as lng}
    <option value={lng.langId}>{lng.name}</option>
  {/each}
</select>
<br />
<select bind:value={voice}>
  {#each langVoices as vo}
    <option value={vo.voiceId}>{vo.name}</option>
  {/each}
</select>
<br />
<select bind:value={model}>
  {#each models as mo}
    <option value={mo.modelId}>
      {mo.size} - {mo.modelId} ({mo.quantization})
    </option>
  {/each}
</select>
<br />
<input type="range" min="0.1" max="2" step="0.1" bind:value={speed} />
<br />
<textarea bind:value={text}></textarea>
<br />
<button onclick={() => process()} disabled={loading}>Process</button>

<br />
<br />
<textarea>{phonemes}</textarea>
<br />

<textarea>{JSON.stringify(tokens)}</textarea>

<br />
<br />

<audio src={voiceUrl} controls></audio>
