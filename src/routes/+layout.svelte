<script>
  let { children } = $props();
  import "../app.css";
  import ThemeSelect from "$lib/client/components/themeSelect.svelte";
</script>

<header>
  <nav>
    <ThemeSelect />
  </nav>
</header>

{@render children()}
