<script>
  import { onMount, setContext, tick } from "svelte";
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
  import { slide, fade, fly } from "svelte/transition";

  import { zoomIdentity } from "d3-zoom";
  import { style } from "d3-selection";

  export let id;

  let current = id;
  let large = false;
  let animating = false;

  console.log("hello from list", id);

  const baseUrl = "https://vikusviewer.fh-potsdam.de/smb/beide/data/1024/";

  let items = [];

  async function link(id, internal) {
    window.scrollTo({ top: 0 });

    if (!internal) {
      window.location.hash = "#/cloud/" + id;
      return;
    }
    animating = true;
    // window.scrollTo({ top: 0, behavior: "smooth" });
    window.location.hash = "#/list/" + id;
    setTimeout(() => (animating = false), 1000);
  }

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
    /* height: 100%; */
    position: absolute;
    background-color: #eeeeee;
    top: 0;
    padding-bottom: 10em;
  }

  .liste {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    /* align-items: center; */
    z-index: 10;
    margin-left: 5em;
    margin-right: 5em;
    max-width: 1200px;
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
    max-width: 1024px;
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
    width: 30%;
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
    /* background: #f9f9f9; */
  }

  .center {
    position: absolute;
    display: none;
    left: -20px;
    top: calc(30%);
    width: 20px;
    height: 40px;
    background-color: #424242;
  }

  .selected .center {
    display: inline;
  }

  .cloud {
    position: absolute;
    display: none;
    left: -20px;
    top: calc(60%);
    width: 20px;
    height: 40px;
    background-color: aqua;
  }

  .selected .cloud {
    display: inline;
  }

  h2 {
    font-size: 1em;
    cursor: pointer;
  }

  .item:last-child .distance {
    display: none;
  }

  .distance {
    opacity: 1;
    transition: visibility 0s, opacity 1s;
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

  .animating .distance {
    visibility: hidden;
    opacity: 0;
  }
</style>

<div class="container">
  Id: {id}
  <div class="liste" class:animating>
    {#each items as item (item.id)}
      <div
        class="item"
        class:large
        class:selected={item.id === current}
        animate:flip={{ duration: 1000 }}>
        <div class="row detail">
          <div class="picture">
            <picture
              on:click={() => ((large = current === item.id ? !large : false), (current = item.id))}>
              <img src="{baseUrl}{item.id}.jpg" alt={item.data._titel} />
            </picture>
            <div
              class="center"
              on:click|preventDefault={() => link(item.id, true)} />
            <div
              class="cloud"
              on:click|preventDefault={() => link(item.id, false)} />
            <!-- <div class="resize" on:click={() => (large = !large)} /> -->
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
