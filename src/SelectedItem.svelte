<script>
    import { onMount } from "svelte";
    import {
        distancesCutoffScore,
        selectedItem,
        detailData,
        darkmode,
        history,
        anchor,
        searchstring,
        // searchItems,
        lastTransformed,
        searchResults
    } from "./stores.js";
    import { get } from "svelte/store";
    import { flip } from "svelte/animate";

    $: data = $selectedItem ? $detailData.get($selectedItem.id) : null

    onMount(() => {
        return () => {};
    });
    </script>
  
  <style>
    .item {
      /* position: absolute; */
      /* left: 50%;
      top: 50%; */
      /* width: 300px; */
      max-width: 300px;
      margin: 1em;
      background: white;
      padding: 1em;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      display: flex;
      flex-flow: column;
      z-index: 100;
      margin-bottom: 10em;
    }
    .container {
        pointer-events: none;
        height: 100%;
        width: 100%;
        left: 0;
        
        top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
    }
  </style>
  
{#if data}
<div class="container">
    <div class="item">
        {data._titel}
       </div>
</div>
   
{/if}

  