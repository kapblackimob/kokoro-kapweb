<script>
  let { children } = $props();
  import "../app.css";
  import { fade } from "svelte/transition";
  import ThemeSelect from "$lib/client/components/themeSelect.svelte";
  import { ExternalLink, Menu, X, Github } from "lucide-svelte";

  let isOpen = $state(false);
</script>

<div
  class="bg-base-200 h-screen w-screen overflow-x-hidden overflow-y-auto md:px-4 md:pb-4"
>
  <div
    class="md:rounded-box mx-auto w-full overflow-hidden md:mt-4 md:max-w-7xl md:shadow-md"
  >
    <header
      class="bg-base-100 border-base-content/20 flex w-full items-center justify-between border-b p-4 md:px-4 md:pt-4"
    >
      <div class="flex items-center space-x-2">
        <img
          src="/logo.png"
          alt="Kokoro Web Logo"
          class="size-[40px] rounded-full shadow-sm md:size-[50px]"
        />
        <h1 class="text-xl font-bold md:text-3xl">Kokoro Web</h1>
      </div>
      <nav class="hidden md:flex md:items-center md:justify-end md:space-x-2">
        <a
          href="https://github.com/eduardolat/kokoro-web"
          target="_blank"
          class="btn btn-ghost"
        >
          <span>Github</span>
          <Github class="size-[16px]" />
        </a>
        <a href="/api/v1/index.html" target="_blank" class="btn btn-ghost">
          <span>API Docs</span>
          <ExternalLink class="size-[16px]" />
        </a>
        <ThemeSelect />
      </nav>
      <button
        class="btn btn-ghost btn-square md:hidden"
        onclick={() => (isOpen = !isOpen)}
      >
        <Menu class="size-[24px]" />
      </button>
    </header>

    {#if isOpen}
      <nav
        class="
          bg-base-200 fixed top-0 z-50 h-screen w-screen space-y-2 overflow-x-hidden
          overflow-y-auto p-4 md:hidden
        "
        transition:fade={{ duration: 100 }}
      >
        <div class="flex justify-end">
          <button
            class="btn btn-ghost btn-square md:hidden"
            onclick={() => (isOpen = !isOpen)}
          >
            <X class="size-[24px]" />
          </button>
        </div>

        <a
          href="https://github.com/eduardolat/kokoro-web"
          target="_blank"
          class="btn btn-outline w-full"
        >
          <span>Github</span>
          <Github class="size-[16px]" />
        </a>
        <a
          href="/api/v1/index.html"
          target="_blank"
          class="btn btn-outline w-full"
        >
          <span>API Docs</span>
          <ExternalLink class="size-[16px]" />
        </a>
        <ThemeSelect class="w-full" />
      </nav>
    {/if}

    <main class="bg-base-100 mx-auto w-full overflow-y-auto p-4 md:max-w-7xl">
      {@render children()}
    </main>
  </div>
</div>
