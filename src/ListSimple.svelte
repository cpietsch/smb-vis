<script>
  import { onMount, setContext } from "svelte";
  import {
    dimensions,
    sprites,
    selectedItem,
    getSelectedDistances,
    umapProjection,
    lastTransformed,
    spriteScale,
    detailData,
    state,
  } from "./stores.js";
  import { get } from "svelte/store";
  import { flip } from "svelte/animate";

  import { zoomIdentity } from "d3-zoom";

  export let id;

  console.log("hello from list", id);

  let items = [];

  $: {
    console.log(id);
    items = $getSelectedDistances(id).map((d) => {
        const data = 
    });
    console.log(items);
  }

  onMount(() => {
    return () => {};
  });
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: absolute;
    background-color: #eeeeee;
    top: 0;
  }

  .liste {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    z-index: 10;
  }
</style>

<div class="container">
  Id: {id}
  <div class="liste">
    {#each items as item (item.id)}
      <div class="item">{item.id}</div>
    {/each}
  </div>
</div>
