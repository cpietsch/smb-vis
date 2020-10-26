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

  // $: console.log($fuseSearch)

  let timer;

  const debounce = v => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			searchstring.set(v)
		}, 350);
	}

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
    /* margin: 1em;
        background: white;
        padding: 1em;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        border-radius: 6px; */
    /*display: flex;
    flex-flow: column;
    z-index: 100;
    overflow: hidden;*/
    pointer-events: visible;
  }

  .item {
    /*display: flex;
    justify-content: space-between;
    flex-flow: column;*/
    width: 100%;
  }

  #search {
    font-size: 13px;
    width: 100%;
    border: none;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    background: #fff;
    padding: 1em;
  }

  #search + svg {
    margin-left: -30px;
    margin-top: 13px;
    position: absolute;
  }

  #search + svg {
    visibility: hidden;
  }
  #search:placeholder-shown + svg {
    visibility: visible;
    opacity: 0.6;
  }

  #search:focus {outline:0;}
</style>

<div class="search">
  <div class="item">
    <div>
      <form on:submit|preventDefault={handleSubmit}>
        <!-- <label for="search">Suche ({$searchResults.length})</label> -->
        <input
          type="search"
          id="search"
          placeholder="Suche"
          on:input={({ target: { value } }) => debounce(value)}
          value={$searchstring} />
          <svg role="presentation" class="i-search" viewBox="0 0 32 32" width="14" height="14" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
            <circle cx="14" cy="14" r="12" />
            <path d="M23 23 L30 30" />
          </svg>
      </form>
    </div>
  </div>
</div>
