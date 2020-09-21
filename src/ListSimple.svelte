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
  import { style } from "d3-selection";

  export let id;

  let current = id;
  let large = false;

  console.log("hello from list", id);

  const baseUrl = "https://vikusviewer.fh-potsdam.de/smb/beide/data/1024/";

  let items = [];

  $: {
    const distances = $getSelectedDistances(id);

    items = distances.map(([id, score], i) => {
      let distance = 0;
      if (i < distances.length - 1) {
        distance = score - distances[i + 1][1];
      }
      const data = $detailData.get(id);
      return { id, score, data, distance };
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
    /* align-items: center; */
    z-index: 10;
    margin-left: 5em;
    margin-right: 5em;
  }

  .item {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    /* margin: 0.5em; */
  }
  .picture {
    /* margin-right: 1em; */
    /* z-index: 10; */
    cursor: pointer;
    position: relative;
    width: 100px;
    transition: width 0.5s;
  }
  .picture img {
    width: 100%;
  }
  .resize {
    width: 20px;
    height: 20px;
    background: #fff;
    right: 5px;
    top: 5px;
    position: absolute;
    display: none;
  }
  .selected .resize {
    display: block;
  }

  .selected {
    z-index: 10;
  }
  .selected .picture {
    width: 35vw;
  }

  .selected.large .picture {
    width: 1024px;
  }

  /* .selected.large .detail {
    flex-direction: column;
  }
  .selected.large .additional {
    position: relative;
  } */

  .selected.large .additional {
    transition: none;
    visibility: hidden;
  }

  .selected.large .meta {
    /* padding-left: 1em; */
    visibility: hidden;
    transition: none;
  }

  /* .large .meta {
    width: 80vw;
  } */

  .additional {
    opacity: 0;

    visibility: hidden;
    position: absolute;
    display: flex;
    flex-direction: column;
    /* width: 45vw; */
  }
  .selected .additional {
    opacity: 1;
    visibility: visible;
    transition: visibility 0s, opacity 0.5s;
    transition-delay: 0.5s;
  }
  .meta {
    flex-grow: 1;
    color: #515151;
    position: relative;
    padding-left: 1em;
    transition: visibility 0s;
    transition-delay: 0.5s;
  }
  .selected .meta {
    padding-left: 2em;
    background-color: #eee;
  }

  h2 {
    font-size: 1em;
    cursor: pointer;
  }

  .distance div {
    /* width: 10px; */
    border: 2px solid rgb(89, 89, 89);
    border-top-left-radius: 100% 200%;
    border-top-right-radius: 100% 200%;
    border-bottom: none;
    transform: rotate(-90deg) translate(2px, -150%);
    z-index: 2;
    /* background-color: blueviolet; */
  }
</style>

<div class="container">
  Id: {id}
  <div class="liste">
    {#each items as item (item.id)}
      <div class="item" class:large class:selected={item.id === current}>
        <div class="row detail">
          <div class="picture">
            <picture
              on:click={() => ((large = current === item.id ? !large : false), (current = item.id))}>
              <img src="{baseUrl}{item.id}.jpg" alt={item.data._titel} />
            </picture>
            <div class="resize" on:click={() => (large = !large)} />
          </div>

          <div class="meta">
            <h2
              on:click={() => ((large = false), (current = current === item.id ? undefined : item.id))}>
              {item.data._titel}
            </h2>
            <div class="additional">
              <p>Beschreibung: {item.data._beschreibung}</p>
              <p>Score: {item.score}</p>
              <p>Jahr: {item.data.year}</p>
            </div>
          </div>
        </div>

        <div class="row distance">
          <div
            style="height: {(20 + item.distance * 2) / 2}px;width: {20 + item.distance * 2}px;" />
        </div>
      </div>
    {/each}
  </div>
</div>
