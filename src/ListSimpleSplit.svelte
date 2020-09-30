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
  import { select, pointer, selection } from "d3-selection";
  import {
    interpolate as d3interpolate,
    interpolateNumber,
  } from "d3-interpolate";

  import { zoomIdentity } from "d3-zoom";
  import { style } from "d3-selection";

  import { cubicInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";

  export let id;

  let current = id;
  let large = false;
  let animating = false;
  let container;

  const fields = [
    "_sammlung",
    "_idnr",
    "_actors",
    "_ort",
    "_datum",
    "_material",
    "_abmessung",
    "_stichwort",
  ];

  console.log("hello from list", id);

  const baseUrl = "https://vikusviewer.fh-potsdam.de/smb/beide/data/1024/";

  let items = [];

  // const size = tweened(1, {
  //   duration: 300,
  //   easing: cubicInOut,
  // });

  // $: {
  //   console.log($size);
  // }

  async function link(id, internal) {
    // window.scrollTo({ top: 0 });
    // container.scrollTop = 0;
    // console.log(container.scrollTop);
    if (!internal) {
      window.scrollTo({ top: 0 });
      window.location.hash = "#/cloud/" + id;
      return;
    }

    animating = true;
    selection()
      .transition("scroll")
      .duration(1000)
      .ease(cubicInOut)
      .tween("scroll", function () {
        const scroll = interpolateNumber(container.scrollTop, 0);
        return function (t) {
          container.scrollTop = scroll(t);
        };
      });

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

  $: details = items.find((d) => d.id === current);

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
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .liste {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    /* align-items: center; */
    z-index: 10;
    margin-left: 5em;
    margin-right: 5em;
    max-width: 1500px;
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
    /*max-width: 1024px;*/
    display: flex;
  }
  .picture img {
    width: 100%;
  }

  .detail {
    position: absolute;
    top: 2em;
    /* height: 100%; */
    /* overflow: scroll; */
    width: 50%;
    right: 0;
    padding: 2em;
    margin-right: 2em;
    padding-left: 220px;
    padding-bottom: 200px;
    /* box-shadow: 0px 0px 140px 0px rgba(0, 0, 0, 0.3); */
    /* pointer-events: none; */
  }

  .detail::before {
    content: "";
    position: absolute;
    width: 150px;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 6;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.11), rgba(0, 0, 0, 0));
    box-shadow: inset 55px -124px 114px -18px rgb(238, 238, 238);
    /* box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.75); */
  }
</style>

<div class="container" bind:this={container}>
  {#if details}
    <div class="detail">
      <h2>{details.data._titel}</h2>
      <p class="beschreibung">
        <b>Beschreibung</b>:
        {details.data._beschreibung}
      </p>
      <p><b>Score</b>: {details.score}</p>
      {#each fields as field}
        <p><b>{field.replace('_', '')}</b>: {details.data[field]}</p>
      {/each}
    </div>
  {/if}

  <div class="liste" class:animating>
    {#each items as item (item.id)}
      <div
        class="item"
        class:large={item.id === current && large}
        class:selected={item.id === current}>
        <div class="row">
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
        </div>
        <div class="row distance">
          <div
            style="height: {(20 + item.distance * 2) / 2}px;width: {20 + item.distance * 2}px;" />
        </div>
      </div>
    {/each}
  </div>
</div>
