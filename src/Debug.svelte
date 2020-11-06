<script>
  // made by christopher pietsch chrispie.com 2020
  import {
    distancesCutoffScore,
    darkmode,
    anchor,
    searchstring,
    lastTransformed,
    searchResults,
  } from "./stores.js";

  function handleSubmit() {
    console.log($searchstring);
    window.scrollTo({ top: 0 });
    window.location.hash = "#/list/suche/" + $searchstring;
  }
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
    overflow: hidden;
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
</style>

<div class="debug">
  <div class="item">
    <div>
      <form on:submit|preventDefault={handleSubmit}>
        <label for="search">Suche ({$searchResults.length})</label>
        <input type="search" id="search" bind:value={$searchstring} />
      </form>
    </div>
  </div>
  <div class="item">
    <label for="zoom">zoom {$lastTransformed.k.toPrecision(4)}</label>
  </div>
  <div class="item">
    <label for="distancesCutoffScore">distancesCutoffScore
      {$distancesCutoffScore}</label>
    <input
      type="range"
      bind:value={$distancesCutoffScore}
      min="1"
      max="80"
      name="distancesCutoffScore" />
  </div>

  <div class="item">
    <div>
      <input type="checkbox" id="darkmode" bind:checked={$darkmode} />
      <label for="darkmode">darkmode</label>
    </div>
  </div>
  {#if $anchor}
    <div class="item">{JSON.stringify($anchor)}</div>
  {/if}
  <!-- <div class="item">
    {#each $history as id}<a href="#/cloud/{id}">{id}</a>{/each}
  </div> -->
  <!-- {#if $selectedItem}
    <div class="item">
      <p>id: {$selectedItem.id}</p>
       <img
        src="https://vikusviewer.fh-potsdam.de/smb/beide/data/1024/{$selectedItem.id}.jpg"
        alt="detail Image" /> 
    </div>
  {/if} -->
</div>
