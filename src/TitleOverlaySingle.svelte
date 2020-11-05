<script>
  // made by christopher pietsch chrispie.com 2020
  import { onMount } from "svelte";
  import {
    distancesCutoffScore,
    selectedItem,
    hoverItem,
    detailData,
    darkmode,
    history,
    sprites,
    anchor,
    getSelectedDistances,
    umapProjection,
    searchstring,
    // searchItems,
    lastTransformed,
    divContainer,
    searchResults,
  } from "./stores.js";
  import { get } from "svelte/store";
  import { flip } from "svelte/animate";
  import { zoomIdentity } from "d3-zoom";
  // import { style } from "d3-selection";

  let mapped = [];
  let items = [];

  // const outer = get(divContainer);
  let container;

  $: {
    if ($selectedItem) {
      const { id } = $selectedItem;
      const distances = $getSelectedDistances(id);
      console.log(distances);
      items = distances
        .map((e) => $umapProjection.find((d) => e[0] == d.id))
        .filter((d) => d)
        .map((d) => {
          const data = $detailData.get(d.id);
          const height = $sprites.get(d.id).height + 0;
          return { data, ...d, height };
        });
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

      //mapped = [items[0]].map((d, i) => {
      mapped = items
        .filter((d, i) => k >= 30 || i == 0)
        .map((d, i) => {
          const { id, data, height } = d;
          // if (!d) console.log(items);
          // console.log(k, height);
          const padding = (height * k) / 2 + 5;
          const x = parseInt(transform.applyX(d.x));
          const y = parseInt(transform.applyY(d.y) + padding);

          return { x, y, id, i, data };
        });

      // mapped = [mapped[0]];

      // console.log(mapped, items);
    } else mapped = [];
  }

  function style(item) {
    return `
            transform: translate(${item.x}px,${item.y}px);
            z-index: ${100 - item.i};
          `;
  }

  function link(id) {
    window.location.hash = "#/list/" + id;
    if ($searchstring !== "") {
      setTimeout(() => searchstring.set(""), 200);
    }
  }

  function wheelProxy(event) {
    $divContainer.dispatchEvent(new event.constructor(event.type, event));
  }

  onMount(() => {
    return () => {};
  });
</script>

<style>
  .item {
    position: absolute;
    /* left: 50%;
        top: 50%; */
    /* width: 300px; */

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
    user-select: none;
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
    right: -33px;
    top: 16px;
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
    height: 20px;
    width: 3px;
    background-color: #333;
  }
  .close:before {
    transform: rotate(45deg);
  }
  .close:after {
    transform: rotate(-45deg);
  }

  .inner {
    position: relative;
    left: -50%;
    max-width: 300px;
    /* overflow: hidden; */
    background: white;
    padding: 10px;
    border-radius: 6px;
    /* display: flex; */
    /* flex-flow: column; */
    z-index: 100;
    /* pointer-events: visible; */
    display: flex;
    align-items: center;
    cursor: pointer;
    pointer-events: visible;
  }
  .dark .inner {
    color: #fff;
    background: #525252;
  }
  .simple {
    /* padding: 0em; */
    background: none !important;
    /* margin: none; */
    pointer-events: none;
  }
  .simple:hover {
    box-shadow: none;
  }
  .inner:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  .inner:hover .arrow {
    right: -3px;
  }

  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 5px;
    position: relative;
    transform: rotate(-45deg);
    margin-right: 15px;
    right: 0;
    transition: right 0.3s;
  }
  .dark .arrow {
    border: solid #eee;
    border-width: 0 3px 3px 0;
  }

  .dark .close:before,
  .dark .close:after {
    background: #fff;
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
  <div class="container" class:dark={$darkmode}>
    {#each mapped as item}
      <div class="item" style={style(item)}>
        <div
          class="inner"
          class:simple={item.i != 0}
          on:click|stopPropagation={() => link(item.id)}
          on:wheel={wheelProxy}>
          {#if item.i == 0}
            <!-- <span class="icon"><img alt="Ähnliche Objekte" src="liste.png" /> -->
            <!-- <span class="size">{items.length}</span> -->
            <span class="arrow" />
            <div
              class="close"
              on:click|stopPropagation={() => selectedItem.set(undefined)} />
          {/if}
          <span>{item.data.titel}</span>
        </div>
      </div>
    {/each}
  </div>
{/if}
