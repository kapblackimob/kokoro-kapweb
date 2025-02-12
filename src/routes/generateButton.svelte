<script lang="ts">
  import { WandSparkles, Loader } from "lucide-svelte";

  interface Props {
    loading: boolean;
    onclick: () => void;
  }

  let { loading, onclick }: Props = $props();
</script>

<div
  class={{
    "rounded-field flex": true,
    "bg-base-300": loading,
    "button-wrapper bg-gradient-to-r from-purple-400 via-green-400 to-blue-400":
      !loading,
  }}
>
  <button
    class={{
      "bg-base-300/50 rounded-field m-1 flex flex-grow cursor-pointer backdrop-blur-md": true,
      "items-center justify-center space-x-2 px-4 py-2 text-xl": true,
      "cursor-wait": loading,
    }}
    onclick={() => onclick()}
    disabled={loading}
  >
    <span>Generate Voice</span>
    {#if loading}
      <Loader class="animate-spin" />
    {:else}
      <WandSparkles />
    {/if}
  </button>
</div>

<style>
  .button-wrapper {
    background-size: 500% 500%;
    animation: gradient 5s ease-in-out infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>
