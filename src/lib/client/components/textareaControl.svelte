<script>
  let {
    title = "",
    helpText = "",
    titleClass = "",
    textareaClass = "",
    helpTextClass = "",
    value = $bindable(),
    ...others
  } = $props();
</script>

<fieldset class="fieldset">
  {#if title}
    <legend class="fieldset-legend {titleClass}">{title}</legend>
  {/if}
  <textarea class="textarea {textareaClass ?? ''}" bind:value {...others}>
  </textarea>
  {#if helpText}
    <span class="fieldset-label {helpTextClass}">{helpText}</span>
  {/if}
</fieldset>
