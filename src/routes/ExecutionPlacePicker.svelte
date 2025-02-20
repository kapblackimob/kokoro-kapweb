<script lang="ts">
  import { Eye, EyeClosed, Settings, X } from "lucide-svelte";
  import { onMount } from "svelte";

  interface Props {
    onExecutionPlaceChange: (value: "browser" | "api") => void;
    onBaseUrlChange: (value: string) => void;
    onApiKeyChange: (value: string) => void;
  }
  let { onExecutionPlaceChange, onBaseUrlChange, onApiKeyChange }: Props =
    $props();

  const defaultBaseUrl = "/api/v1/audio/speech";

  let value = $state("browser" as "browser" | "api");
  let isApi = $derived(value === "api");
  let apiKey = $state("");
  let baseUrl = $state(defaultBaseUrl);
  let isDefaultBaseUrl = $derived(baseUrl === defaultBaseUrl);
  let showApiKey = $state(false);
  let hasMounted = $state(false);

  $effect(() => onExecutionPlaceChange(value));
  $effect(() => onBaseUrlChange(baseUrl));
  $effect(() => onApiKeyChange(apiKey));

  onMount(() => {
    const storedBaseUrl = localStorage.getItem("kokoro-web-base-url");
    if (storedBaseUrl) baseUrl = storedBaseUrl;

    const storedKey = localStorage.getItem("kokoro-web-api-key");
    if (storedKey) apiKey = storedKey;

    hasMounted = true;
  });

  $effect(() => {
    if (!hasMounted) return;
    localStorage.setItem("kokoro-web-api-key", apiKey);
    localStorage.setItem("kokoro-web-base-url", baseUrl);
  });

  function toggleShowApiKey() {
    showApiKey = !showApiKey;
  }

  function reset() {
    if (!confirm("Are you sure you want to reset the API settings?")) return;
    baseUrl = defaultBaseUrl;
    apiKey = "";
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
      Include an
      <a
        href="https://platform.openai.com/docs/guides/text-to-speech?lang=curl"
        target="_blank"
        class="link"
      >
        OpenAI compatible
      </a>
      Base URL and API Key.
    </p>

    <p class="pt-2 font-semibold">
      This setting is saved in your browser's localStorage and is used for all
      profiles.
    </p>

    <label class="mt-4 block flex-grow">
      <span class="text-xs font-semibold">Base URL</span>
      <input
        type="text"
        class="input w-full"
        bind:value={baseUrl}
        placeholder="Enter an OpenAI compatible API Base URL"
      />
      {#if isDefaultBaseUrl}
        <span class="block pt-1 text-xs font-semibold">
          <span class="block">
            The default Base URL is only available for self-hosted instances.
          </span>
          <a
            href="https://github.com/eduardolat/kokoro-web"
            target="_blank"
            class="link"
          >
            How to self-host?
          </a>
        </span>
      {/if}
    </label>

    <label class="mt-2 block flex-grow">
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

    <div class="mt-6 flex w-full justify-between space-x-2">
      <button class="btn btn-ghost" onclick={reset}>Reset</button>
      <form method="dialog">
        <button class="btn btn-primary">OK</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
