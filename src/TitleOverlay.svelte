<script>
  import { onMount } from "svelte";
  import {
    distancesCutoffScore,
    selectedItem,
    detailData,
    darkmode,
    history,
    anchor,
    getSelectedDistances,
    umapProjection,
    searchstring,
    // searchItems,
    lastTransformed,
    searchResults,
  } from "./stores.js";
  import { get } from "svelte/store";
  import { flip } from "svelte/animate";
  import { zoomIdentity } from "d3-zoom";
  // import { style } from "d3-selection";

  let mapped = [];
  let items = [];

  $: {
    if ($selectedItem) {
      const { id } = $selectedItem;
      const distances = $getSelectedDistances(id);
      // console.log(distances);
      items = distances.map((e) => $umapProjection.find((d) => e[0] == d.id));
    } else {
      items = [];
    }
  }

  $: data = $selectedItem ? $detailData.get($selectedItem.id) : null;

  $: {
    if ($selectedItem) {
      const { x, y, k } = $lastTransformed;
      // console.log(x, y, k);
      const transform = zoomIdentity.translate(x, y).scale(k);

      mapped = items.map((d, i) => {
        const id = d.id;
        const x = transform.applyX(d.x);
        const y = transform.applyY(d.y);
        const data = $detailData.get(id);

        return { x, y, id, i, data };
      });

      // console.log(mapped, items);
    } else mapped = [];
  }

  function style(item) {
    return `
          transform: translate(${item.x}px,${item.y}px);
          z-index: ${100 - item.i};
          opacity: ${1 - item.i / (items.length * 1.5)};
          pointer-events: ${item.i == 0 ? "all" : "none"}
        `;
  }

  function link(id) {
    window.location.hash = "#/list/" + id;
  }

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
    /* overflow: hidden; */
    margin: 1em;
    background: white;
    padding: 1em;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    /* display: flex; */
    /* flex-flow: column; */
    position: absolute;
    z-index: 100;
    pointer-events: visible;
    display: flex;
    align-items: center;
    cursor: pointer;

    /* margin-bottom: 10em; */
  }
  .container {
    pointer-events: none;
    height: 100%;
    width: 100%;
    left: 0;
    overflow: hidden;
    top: 0;
    /* display: flex;
        align-items: center;
        justify-content: center; */
    position: absolute;
  }

  .icon {
    cursor: pointer;
    margin-right: 1em;
    display: flex;
    align-items: center;
    /* padding: 4px;
    background-color: #eee; */
  }
  .size {
    margin-left: 5px;
    color: #666;
    font-size: 0.8em;
  }

  .close {
    position: absolute;
    right: -15px;
    top: -18px;
    width: 32px;
    height: 32px;
    opacity: 0.6;
    cursor: pointer;
  }
  .close:hover {
    opacity: 1;
  }
  .close:before,
  .close:after {
    position: absolute;
    left: 15px;
    content: " ";
    height: 33px;
    width: 4px;
    background-color: #333;
  }
  .close:before {
    transform: rotate(45deg);
  }
  .close:after {
    transform: rotate(-45deg);
  }
</style>

<!-- {#if data}
<div class="container">
    <div class="item">
        {data._titel}
       </div>
</div>
{/if} -->

{#if data}
<div class="container">
  {#each mapped as item}
  <div class="item" style={style(item)} on:click|preventDefault={() => link(item.id)}>
    
    {#if item.i == 0}
    <span class="icon" ><img alt="Ähnliche Objekte" src="liste.png" ><span class="size">{items.length}</span></span>
    <div class="close" on:click|preventDefault={() => selectedItem.set(undefined)}></div>
    {/if}
    {item.data._titel}
   </div>
  {/each}
    
</div>
{/if}
