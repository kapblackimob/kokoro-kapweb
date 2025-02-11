<script>
  let { children } = $props();
  import "../app.css";
  import ThemeSelect from "$lib/client/components/themeSelect.svelte";
</script>

<div
  class="bg-base-200 h-screen w-screen overflow-x-hidden overflow-y-auto md:px-4"
>
  <header
    class="
      bg-base-300 md:rounded-box sticky z-50 mx-auto flex w-full items-center
      justify-between p-4 shadow-md md:top-4 md:max-w-7xl md:px-4 md:pt-4
    "
  >
    <h1 class="text-xl font-bold md:text-3xl">Kokoro Web</h1>
    <nav>
      <ThemeSelect />
    </nav>
  </header>

  <main
    class=" bg-base-100 md:rounded-box mx-auto w-full p-4 shadow-lg md:mt-8 md:max-w-7xl"
  >
    {@render children()}
  </main>
</div>
