<script>
  import { onMount } from "svelte";
  import { distancesCutoffScore, selectedItem } from "./stores.js";
  import { get } from "svelte/store";
  import { flip } from "svelte/animate";

  onMount(() => {
    return () => {};
  });
</script>

<style>
  .debug {
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    margin: 1em;
    background: white;
    padding: 1em;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    display: flex;
    flex-flow: column;
    z-index: 100;
  }

  .item {
    display: flex;
    justify-content: space-between;
    flex-flow: column;
    width: 100%;
  }

  .item * {
    padding: 0.5rem;
  }

  img {
    width: 30%;
    position: relative;
  }
</style>

<div class="debug">
  <div class="item">
    <label for="distancesCutoffScore">distancesCutoffScore {$distancesCutoffScore}</label>
    <input
      type="range"
      bind:value={$distancesCutoffScore}
      min="1"
      max="80"
      name="distancesCutoffScore" />
  </div>

  {#if $selectedItem}
    <div class="item">
      <p>id: {$selectedItem.id}</p>
      <!-- <img
        src="https://vikusviewer.fh-potsdam.de/smb/beide/data/1024/{$selectedItem.id}.jpg"
        alt="detail Image" /> -->
    </div>
  {/if}
</div>
