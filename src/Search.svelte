<script>
  import { onMount } from "svelte";
  import {
    distancesCutoffScore,
    selectedItem,
    darkmode,
    history,
    anchor,
    searchstring,
    // searchItems,
    lastTransformed,
    searchResults,
  } from "./stores.js";
  import { get } from "svelte/store";
  import { flip } from "svelte/animate";

  $: numResults = $searchResults.length;
  let timer;

  const debounce = (v) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (v.length > 2 || v.length == 0) searchstring.set(v);
    }, 350);
  };

  function handleSubmit() {
    console.log($searchstring);
    window.scrollTo({ top: 0 });
    window.location.hash = "#/list/suche/" + $searchstring;
  }

  onMount(() => {
    return () => {};
  });
</script>

<style>
  .search {
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    padding: 1em;
    pointer-events: none;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  form {
    width: 100%;
  }

  .searchinput {
    font-size: 1em;
    width: 100%;
    border: none;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    background: #fff;
    padding: 0.8em;
    z-index: 100;
    pointer-events: visible;
  }

  .searchinput + svg {
    margin-left: -30px;
    margin-top: 14px;
    position: absolute;
    cursor: pointer;
  }

  .searchinput + svg {
    visibility: hidden;
  }
  .searchinput:placeholder-shown + svg {
    visibility: visible;
    opacity: 0.6;
  }
  .searchinput::-webkit-search-cancel-button {
    cursor: pointer;
  }

  .searchinput:focus {
    outline: 0;
  }

  .button {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    background: #c1c1c1;
    padding: 1em;
    position: absolute;
    font-size: 0.8em;
    z-index: -1;
    top: 50px;
    color: #000;
    padding-top: 1.5em;
    /* left: 26px; */
    cursor: pointer;
    pointer-events: all;
  }
</style>

<div class="search">
  <form on:submit|preventDefault={handleSubmit}>
    <!-- <label for="search">Suche ({$searchResults.length})</label> -->
    <input
      type="search"
      class="searchinput"
      placeholder="Suche"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      on:input={({ target: { value } }) => debounce(value)}
      value={$searchstring} />
    <svg
      role="presentation"
      class="i-search"
      viewBox="0 0 32 32"
      width="14"
      height="14"
      fill="none"
      stroke="currentcolor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="3">
      <circle cx="14" cy="14" r="12" />
      <path d="M23 23 L30 30" />
    </svg>
  </form>
  {#if numResults && $searchstring != ''}
    <div class="button" on:click={handleSubmit}>
      Ergebnisse ({numResults}) als Liste anzeigen
    </div>
  {/if}
</div>
