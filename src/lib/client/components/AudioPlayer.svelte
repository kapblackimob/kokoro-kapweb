<script lang="ts">
  import WaveSurfer from "wavesurfer.js";
  import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
  import { Download, Pause, Play } from "lucide-svelte";
  import { fade } from "svelte/transition";

  interface Props {
    audioUrl: string;
  }
  let { audioUrl }: Props = $props();

  let waveSurfer: WaveSurfer | null = null;

  let isPlaying = $state(false);
  let playbackSpeed = $state(1);
  let totalDuration = $state("0:00");
  let currentTime = $state("0:00");

  $effect(() => {
    if (!audioUrl && waveSurfer !== null) {
      waveSurfer.destroy();
      waveSurfer = null;
      return;
    }
    if (!audioUrl) return;

    waveSurfer = WaveSurfer.create({
      height: 40,
      normalize: true,
      cursorWidth: 3,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      container: "#waveform",
      waveColor: "#c2c2c2",
      progressColor: window
        .getComputedStyle(document.body)
        .getPropertyValue("--color-primary"),
      url: audioUrl,
    });

    waveSurfer.registerPlugin(
      Spectrogram.create({
        labels: true,
        height: 200,
        splitChannels: true,
        scale: "logarithmic",
        frequencyMax: 8000,
        frequencyMin: 0,
        fftSamples: 1024,
        labelsBackground: "rgba(0, 0, 0, 0.1)",
        container: "#spectrogram",
      }),
    );

    waveSurfer.on("play", () => {
      isPlaying = true;
    });

    waveSurfer.on("pause", () => {
      isPlaying = false;
    });

    waveSurfer.on("ready", (newTotalDuration) => {
      totalDuration = secondsToMinutes(newTotalDuration);
    });

    waveSurfer.on("timeupdate", (newCurrentTime) => {
      currentTime = secondsToMinutes(newCurrentTime);
    });
  });

  $effect(() => {
    if (!waveSurfer) return;
    waveSurfer.setPlaybackRate(playbackSpeed, true);
  });

  function secondsToMinutes(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function playOrPause() {
    if (!waveSurfer) return;

    if (isPlaying) {
      waveSurfer.pause();
    } else {
      waveSurfer.play();
    }
  }
</script>

<div
  class="bg-base-100 border-base-content/20 rounded-box overflow-hidden border shadow-md"
>
  <div class="p-2">
    <div class="flex w-full items-center justify-between">
      <div class="flex items-center justify-start space-x-2">
        <button class="btn btn-ghost btn-circle" onclick={playOrPause}>
          {#if isPlaying}
            <span in:fade>
              <Pause class="size-6" />
            </span>
          {:else}
            <span in:fade>
              <Play class="size-6" />
            </span>
          {/if}
        </button>
        <span>{currentTime} - {totalDuration}</span>
      </div>

      <div class="flex items-center justify-end space-x-2">
        <a href={audioUrl} download class="btn btn-ghost btn-circle">
          <Download class="size-6" />
        </a>
      </div>
    </div>

    <div id="waveform" class="flex-grow p-2"></div>
  </div>

  <div id="spectrogram" class="flex-grow"></div>
</div>
