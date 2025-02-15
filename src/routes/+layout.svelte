<script>
  let { children } = $props();
  import "../app.css";
  import ThemeSelect from "$lib/client/components/themeSelect.svelte";
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
        <h1 class="hidden text-3xl font-bold md:inline">Kokoro Web</h1>
        <h1 class="inline text-3xl font-bold md:hidden">KW</h1>
      </div>
      <nav>
        <ThemeSelect />
      </nav>
    </header>

    <main class="bg-base-100 mx-auto w-full overflow-y-auto p-4 md:max-w-7xl">
      {@render children()}
    </main>
  </div>
</div>
