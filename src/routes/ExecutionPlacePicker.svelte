<script lang="ts">
  import { Eye, EyeClosed, Settings, X } from "lucide-svelte";
  import { onMount } from "svelte";

  interface Props {
    onExecutionPlaceChange: (value: "browser" | "api") => void;
    onApiKeyChange: (value: string) => void;
  }
  let { onExecutionPlaceChange, onApiKeyChange }: Props = $props();

  let value = $state("browser" as "browser" | "api");
  let isApi = $derived(value === "api");
  let apiKey = $state("");
  let showApiKey = $state(false);
  let hasMounted = $state(false);

  $effect(() => onExecutionPlaceChange(value));
  $effect(() => onApiKeyChange(apiKey));

  onMount(() => {
    const storedKey = localStorage.getItem("kokoro-web-api-key");
    if (storedKey) apiKey = storedKey;
    hasMounted = true;
  });

  $effect(() => {
    if (!hasMounted) return;
    localStorage.setItem("kokoro-web-api-key", apiKey);
  });

  function toggleShowApiKey() {
    showApiKey = !showApiKey;
  }
</script>

<fieldset class="fieldset w-full">
  <legend class="fieldset-legend">Execution place</legend>

  <div class="flex items-center space-x-2">
    <select class="select w-full" bind:value>
      <option value="browser">Browser</option>
      <option value="api">API</option>
    </select>

    {#if isApi}
      <div
        class="tooltip tooltip-left inline-block"
        data-tip="API Auth settings"
      >
        <button
          class="btn btn-soft btn-square"
          onclick={(window as any).api_settings.showModal()}
        >
          <Settings class="size-5" />
        </button>
      </div>
    {/if}
  </div>

  <span class="fieldset-help">
    Select where the generation will occur. API is only available for
    self-hosted instances.
  </span>
</fieldset>

<dialog id="api_settings" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">
        <X />
      </button>
    </form>

    <h3 class="text-lg font-bold">API Settigs</h3>
    <p class="pt-2">
      When you use the API to generate the voice you can optionally include an
      authentication token.
    </p>
    <p class="py-2 pb-4 font-semibold">
      This setting is saved in your browser's localStorage and is used for all
      profiles.
    </p>

    <label class="flex-grow">
      <span class="text-xs font-semibold">API Key</span>
      <div class="mt-1 flex items-center space-x-2">
        <input
          type={showApiKey ? "text" : "password"}
          class="input w-full"
          bind:value={apiKey}
          placeholder="Enter your API key"
        />

        <div
          class="tooltip tooltip-left inline-block"
          data-tip={showApiKey ? "Hide" : "Show"}
        >
          <button class="btn btn-soft btn-square" onclick={toggleShowApiKey}>
            {#if showApiKey}
              <Eye class="size-5" />
            {:else}
              <EyeClosed class="size-5" />
            {/if}
          </button>
        </div>
      </div>
    </label>

    <form method="dialog" class="mt-4 flex w-full justify-end">
      <button class="btn btn-primary">OK</button>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
