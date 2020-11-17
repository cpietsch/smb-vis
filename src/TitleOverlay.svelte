<script>
  // made by christopher pietsch chrispie.com 2020
  import {
    selectedItem,
    detailData,
    darkmode,
    sprites,
    getSelectedDistances,
    umapProjection,
    searchstring,
    lastTransformed,
    divContainer,
  } from "./stores.js";

  import { zoomIdentity } from "d3-zoom";

  let mapped = [];
  let items = [];

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
      const transform = zoomIdentity.translate(x, y).scale(k);

      mapped = [items[0]]
        //items.filter((d, i) => k >= 30 || i == 0)
        .map((d, i) => {
          const { id, data, height } = d;
          const padding = (height * k) / 2 + 5;
          const x = parseInt(transform.applyX(d.x));
          const y = parseInt(transform.applyY(d.y) + padding);

          return { x, y, id, i, data };
        });
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
</script>

<style>
  .item {
    position: absolute;
  }
  .container {
    pointer-events: none;
    height: 100%;
    width: 100%;
    left: 0;
    overflow: hidden;
    top: 0;
    position: absolute;
    user-select: none;
  }

  .close {
    position: absolute;
    width: 29px;
    height: 29px;
    padding: 6px;
    /* opacity: 0.6; */
    border-radius: 25px;
    cursor: pointer;
    background: #dadada;
    right: -15px;
    top: -16px;
    pointer-events: all;
  }
  .close:hover:before,
  .close:hover:after {
    background-color: #000;
  }
  .close:before,
  .close:after {
    position: absolute;
    left: 13px;
    content: " ";
    height: 17px;
    width: 3px;
    background-color: #888888;
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
    background: white;
    padding: 10px;
    border-radius: 6px;
    z-index: 100;
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
    background: none !important;
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

{#if data}
  <div class="container" class:dark={$darkmode}>
    {#each mapped as item}
      <div class="item" style={style(item)}>
        <div
          class="inner"
          class:simple={item.i != 0}
          on:click|stopPropagation={() => link(item.id)}
          on:wheel={wheelProxy}>
          <!-- {#if item.i == 0}<span class="arrow" />{/if} -->
          <span><b>{item.data.titel}</b> im Pfad anzeigen</span>
          {#if item.i == 0}
            <div
              class="close"
              on:click|stopPropagation={() => selectedItem.set(undefined)} />
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
