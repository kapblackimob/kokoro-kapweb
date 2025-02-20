<script lang="ts">
  import type { LangId, ModelId } from "$lib/shared/resources";
  import { FilePlus, Save, Trash } from "lucide-svelte";
  import { onMount } from "svelte";

  interface Settings {
    text: string;
    lang: LangId;
    voiceFormula: string;
    model: ModelId;
    speed: number;
    format: "mp3" | "wav";
  }

  interface Profile {
    name: string;
    settings: Settings;
  }

  interface Props {
    currentSettings: Settings;
    onChange: (settings: Settings) => void;
  }

  let { currentSettings, onChange }: Props = $props();

  let profiles = $state([] as Profile[]);
  let selectedProfileIndex = $state(-1);
  let isNoProfile = $derived(selectedProfileIndex === -1);

  onMount(() => {
    loadProfiles();
  });

  function loadProfiles() {
    const stored = localStorage.getItem("kokoro-web-profiles");
    profiles = stored ? JSON.parse(stored) : [];
  }

  function saveProfiles() {
    localStorage.setItem("kokoro-web-profiles", JSON.stringify(profiles));
  }

  function updateSelection() {
    if (selectedProfileIndex >= 0 && selectedProfileIndex < profiles.length) {
      onChange(profiles[selectedProfileIndex].settings);
    }
  }

  function saveProfile() {
    if (isNoProfile) {
      const newName = window.prompt("Enter a new profile name:");
      if (!newName) return;
      profiles.push({ name: newName, settings: { ...currentSettings } });
      selectedProfileIndex = profiles.length - 1;
      saveProfiles();
      updateSelection();
    } else {
      profiles[selectedProfileIndex].settings = { ...currentSettings };
      saveProfiles();
    }
  }

  function deleteProfile() {
    if (isNoProfile) return;
    if (window.confirm("Are you sure you want to delete this profile?")) {
      profiles.splice(selectedProfileIndex, 1);
      selectedProfileIndex = -1;
      saveProfiles();
    }
  }
</script>

<div class="flex items-center space-x-2">
  <select
    bind:value={selectedProfileIndex}
    onchange={updateSelection}
    class="select select-bordered flex-grow"
  >
    <option value={-1}>&lt;no profile&gt;</option>
    {#each profiles as profile, index}
      <option value={index}>{profile.name}</option>
    {/each}
  </select>
  <div
    class="tooltip tooltip-left inline-block"
    data-tip={isNoProfile ? "Create a new profile" : "Save changes"}
  >
    <button onclick={saveProfile} class="btn btn-square">
      {#if isNoProfile}
        <FilePlus class="size-5" />
      {:else}
        <Save class="size-5" />
      {/if}
    </button>
  </div>
  {#if !isNoProfile}
    <div
      class="tooltip tooltip-left inline-block"
      data-tip="Delete this profile"
    >
      <button onclick={deleteProfile} class="btn btn-square">
        <Trash class="size-5" />
      </button>
    </div>
  {/if}
</div>
