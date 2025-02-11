<script>
  let {
    title = "",
    helpText = "",
    titleClass = "",
    selectClass = "",
    helpTextClass = "",
    value = $bindable(),
    children,
    ...others
  } = $props();
</script>

<fieldset class="fieldset">
  {#if title}
    <legend class="fieldset-legend {titleClass}">{title}</legend>
  {/if}
  <select class="select {selectClass ?? ''}" bind:value {...others}>
    {#if children}
      {@render children()}
    {/if}
  </select>
  {#if helpText}
    <span class="fieldset-help {helpTextClass}">{helpText}</span>
  {/if}
</fieldset>
