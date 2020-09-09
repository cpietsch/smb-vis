<script>
  import { onMount } from "svelte";
  import { distancesCutoffScore } from "./stores.js";
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
  }

  .item {
    display: flex;
    justify-content: space-between;
    flex-flow: column-reverse;
  }

  .item * {
    padding: 0.5rem;
  }
</style>

<div class="debug">
  <div class="item">
    <label for="distancesCutoffScore">distancesCutoffScore {$distancesCutoffScore}</label>
    <input
      type="range"
      bind:value={$distancesCutoffScore}
      min="1"
      max="100"
      name="distancesCutoffScore" />
  </div>
</div>
