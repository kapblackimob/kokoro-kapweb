<script lang="ts">
  import { FilePlus, Save, Trash } from "lucide-svelte";
  import { onMount } from "svelte";
  import {
    defaultProfile,
    loadProfile,
    profile,
    type ProfileData,
  } from "./store.svelte";
  import { toaster } from "$lib/client/toaster";

  const localStorageKey = "kokoro-web-profiles";
  let profiles = $state<ProfileData[]>([]);
  let selectedProfileIndex = $state(-1);
  let isNoProfile = $derived(selectedProfileIndex === -1);

  onMount(() => loadProfiles());
  function loadProfiles() {
    const stored = localStorage.getItem(localStorageKey);
    profiles = stored ? JSON.parse(stored) : [];
  }

  function saveProfiles() {
    localStorage.setItem(localStorageKey, JSON.stringify(profiles));
  }

  function updateSelection() {
    if (selectedProfileIndex >= 0 && selectedProfileIndex < profiles.length) {
      loadProfile(profiles[selectedProfileIndex]);
    } else {
      loadProfile(defaultProfile);
    }
  }

  function saveProfile() {
    if (isNoProfile) {
      const newName = window.prompt("Enter a new profile name:");

      if (!newName) return;
      if (profiles.some((prof) => prof.name === newName)) {
        toaster.error("Profile name already exists");
        return;
      }

      profiles.push({ ...profile, name: newName });
      selectedProfileIndex = profiles.length - 1;

      saveProfiles();
      updateSelection();
    } else {
      profiles[selectedProfileIndex] = { ...profile };
      saveProfiles();
    }

    toaster.success("Profile saved");
  }

  function deleteProfile() {
    if (isNoProfile) return;

    if (!window.confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    profiles.splice(selectedProfileIndex, 1);
    selectedProfileIndex = -1;
    saveProfiles();

    toaster.success("Profile deleted");
  }
</script>

<fieldset class="fieldset w-full">
  <legend class="fieldset-legend">Profile</legend>

  <div class="flex items-center space-x-2">
    <select
      class="select w-full"
      bind:value={selectedProfileIndex}
      onchange={updateSelection}
    >
      <option value={-1}>&lt;no profile&gt;</option>
      {#each profiles as prof, index}
        <option value={index}>{prof.name}</option>
      {/each}
    </select>

    <div
      class="tooltip tooltip-left inline-block"
      data-tip={isNoProfile ? "Create a new profile" : "Save profile changes"}
    >
      <button onclick={saveProfile} class="btn btn-soft btn-square">
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
        <button onclick={deleteProfile} class="btn btn-soft btn-square">
          <Trash class="size-5" />
        </button>
      </div>
    {/if}
  </div>

  <span class="fieldset-help">
    Profiles are saved settings that can be loaded later, they are stored in
    your browser.
  </span>
</fieldset>
