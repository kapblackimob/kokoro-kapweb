<script lang="ts">
  interface Props {
    title?: string;
    titleClass?: string;
    inputClass?: string;
    helpText?: string;
    helpTextClass?: string;
    value?: any;
    [key: string]: unknown;
  }

  let {
    title,
    titleClass,
    inputClass,
    helpText,
    helpTextClass,
    value = $bindable(),
    ...others
  }: Props = $props();

  let titleValue = $derived.by(() => {
    if (!title) return value;
    return `${title} - ${value}`;
  });
</script>

<fieldset class="fieldset">
  <legend class="fieldset-legend {titleClass}">{titleValue}</legend>
  <input type="range" class="range {inputClass ?? ''}" bind:value {...others} />
  {#if helpText}
    <span class="fieldset-label {helpTextClass}">{helpText}</span>
  {/if}
</fieldset>
