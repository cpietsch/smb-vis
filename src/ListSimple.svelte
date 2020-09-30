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

    justify-content: center;
    display: flex;
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
    width: 80%;
    margin-top: 3em;
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
    z-index: 10;
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
    width: 40%;
  }

  .selected.large .picture {
    width: 1024px;
    max-width: 100%;
  }

  /* .selected.large .detail {
    flex-direction: column;
  }
  .selected.large .additional {
    position: relative;
  } */

  /* .selected.large .additional {
    transition: none;
    display:none;
  } */

  .selected.large .meta {
    /* padding-left: 1em; */
    display: none;
    transition: none;
  }

  /* .large .meta {
    width: 80vw;
  } */

  .additional {
    opacity: 0;

    /* display: none; */
    /* position: absolute; */
    flex-direction: column;
    visibility: hidden;
    /* width: 45vw; */
  }
  .additional .beschreibung {
    display: -webkit-box;
    -webkit-line-clamp: 9;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .selected .additional {
    display: flex;

    opacity: 1;
    visibility: visible;
    transition: visibility 0s, opacity 0.5s;
    transition-delay: 0.5s;
  }
  .metacontainer {
    /* margin: 20px; */
    display: flex;
    position: relative;
    flex-grow: 1;
    background: #eee;
  }
  .meta {
    flex-grow: 1;
    /* max-width: 60%; */
    color: #515151;
    position: absolute;
    padding-left: 1em;
    /* transition: visibility 0s;
    transition-delay: 0.5s; */
    font-size: 0.9em;
  }
  .selected .meta {
    padding-left: 2em;
    padding-bottom: 200px;
    /* box-shadow: 10px 0 5px -2px #888; */
    /* background: #f9f9f9; */
  }

  .selected .meta::before {
    content: "";
    position: absolute;
    width: 150px;
    height: 100%;
    top: 0;
    left: -150px;
    z-index: 6;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.11), rgba(0, 0, 0, 0));
    box-shadow: inset 55px -124px 114px -18px rgb(238, 238, 238);
    /* box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.75); */
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
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .selected h2 {
    white-space: inherit;
    /* font-size: 1.5em; */
    /* margin-top: 0.5em; */
    /* margin-bottom: 2em; */
  }
  p {
    line-height: 1.4em;
    margin-top: 0;
  }

  b {
    width: 137px;
    display: inline-block;
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

  .current:not(.selected) .metacontainer {
    background: #ffffff8c;
  }

  /* .current .meta {
    background: none;
  } */

  .current .distance div {
    border-width: 7px;
  }

  .current .sobjects {
    display: none;
  }

  .link {
    cursor: pointer;
    cursor: pointer;
    display: inline-flex;
    background: white;
    border-radius: 21em;
    padding: 1em;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }
  .link img {
    margin-right: 1em;
  }
</style>

<div class="container" bind:this={container}>
  <div class="liste" class:animating>
    {#each items as item (item.id)}
      <div
        class="item"
        class:large={item.id === current && large}
        class:current={item.id === id}
        class:selected={item.id === current}>
        <!-- animates:flip={{ duration: 1000, easing: cubicInOut }} -->
        <div class="row detail">
          <div class="picture">
            <picture
              on:click={() => ((large = current === item.id ? !large : false), (current = item.id))}>
              <img src="{baseUrl}{item.id}.jpg" alt={item.data._titel} />
            </picture>
            <div
              class="center"
              on:click|preventDefault={() => link(item.id, false)} />
            <!-- <div
              class="cloud"
              on:click|preventDefault={() => link(item.id, false)} /> -->
            <!-- <div class="resize" on:click={() => (large = !large)} /> -->
          </div>
          <div class="metacontainer">
            <div class="meta">
              <h2
                on:click={() => ((large = false), (current = current === item.id ? undefined : item.id))}>
                {item.data._titel}
              </h2>
              <div class="additional">
                <p class="beschreibung">
                  <b>Beschreibung</b>: {item.data._beschreibung}
                </p>
                <p><b>Score</b>: {item.score}</p>
                {#each fields as field}
                  <p><b>{field.replace('_', '')}</b>: {item.data[field]}</p>
                {/each}
                <p class="sobjects">
                  <span class="link" on:click|preventDefault={() => link(item.id, true)}>
                  <img alt="ähnliche Objeke" src="liste.png">Ähnliche Objeke</span>
                </p>
              </div>
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
