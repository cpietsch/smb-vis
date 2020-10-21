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
    searchResults,
    searchstring,
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
  export let search;

  let current = id;
  let large = false;
  let animating = false;
  let container;

  const fields = [
    ["idnr", "Ident.Nr."],
    ["actors", "Beteiligte"],
    ["ort", "Geographische Bezüge"],
    ["datum", "Datierung"],
    ["material", "Material und Technik"],
    ["abmessung", "Abmessungen und Gewicht"],
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
    if (id === "suche" && $searchstring !== search) {
      $searchstring = search;
    }
  }

  $: {
    if (id === "suche") {
      console.log($searchResults);
      items = $searchResults
        .map((id) => {
          const data = $detailData.get(id);
          return { id, score: 1, data, distance: 10 };
        })
        .filter((a, i) => i < 30);
      console.log(items);
      current = undefined;
    } else {
      const distances = $getSelectedDistances(id);

      items = distances.map(([id, score], i) => {
        let distance = 0;
        if (i < distances.length - 1) {
          distance = score - distances[i + 1][1];
        }
        const data = $detailData.get(id);
        return { id, score, data, distance };
      });
    }

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
    margin-top: 120px;
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
  .picture picture {
    z-index: 100;
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
    width: 50%;
  }

  .selected.large .picture {
    width: 1024px;
    max-width: 100%;
    max-height: 100%;
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
    /* -webkit-line-clamp: 9;
    -webkit-box-orient: vertical;
    overflow: hidden; */
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
    background: #eee;
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
    left: -85px;
    top: calc(50% - 20px);
    /* width: 90px; */
    height: 40px;
    background-color: #fff;

    border-radius: 6px;
    padding: 10px;
    padding-left: 15px;
    padding-right: 45px;
    opacity: 0.7;
    transition: left 0.2s, opacity 0.2s;
  }

  .center:hover {
    left: -92px;
    opacity: 1;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 5px;
  }

  .left {
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
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
    width: 30%;
    /* text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden; */
  }
  .selected h2 {
    white-space: inherit;
    width: inherit;
    font-size: 1.3em;
    margin-top: 0.5em;
    /* margin-bottom: 2em; */
  }
  p {
    line-height: 1.4em;
    margin-top: 0;
    display: flex;
    align-items: center;
  }

  b {
    width: 150px;
    min-width: 150px;
  }

  .item:last-child .distance {
    display: none;
  }

  .distance {
    opacity: 1;
    transition: visibility 0s, opacity 1s;
  }

  .distance svg {
    /* width: 10px; */
    position: relative;
    background-color: none;
    z-index: 2;
    /* background-color: blueviolet; */
  }

  .animating .distance {
    visibility: hidden;
    opacity: 0;
  }

  .metacontainer a {
    color: #515151;
  }

  /* .current:not(.selected) .metacontainer {
     background: #ffffff8c; 
  } */

  /* .current .meta {
    background: none;
  } */

  /* .current .distance div {
    border-width: 7px;
  } */

  .current .sobjects {
    display: none;
  }

  .link {
    cursor: pointer;
    display: inline-flex;
    background: white;
    border-radius: 6px;
    padding: 1em;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    align-items: center;
  }
  .link:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  .link img {
    margin-right: 1em;
  }

  b {
    /* text-transform: capitalize; */
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
              on:click|preventDefault={() => link(item.id, false)}>
              <div class="arrow left" />
              <span>Wolke</span>
            </div>
            <!-- <div
              class="cloud"
              on:click|preventDefault={() => link(item.id, false)} /> -->
            <!-- <div class="resize" on:click={() => (large = !large)} /> -->
          </div>
          <div class="metacontainer">
            <div class="meta">
              <h2
                on:click={() => ((large = false), (current = current === item.id ? undefined : item.id))}>
                {item.data.titel}
              </h2>
              <div class="additional">
                <p class="beschreibung">{item.data.beschreibung}</p>
                <!-- <p><b>Score</b>{item.score}</p> -->
                <p><b>Sammlung</b><span>{item.data.sammlunglong}</span></p>
                {#each fields as field}
                  {#if item.data[field[0]] !== ''}
                    <p><b>{field[1]}</b><span>{item.data[field[0]]}</span></p>
                  {/if}
                {/each}
                <p>
                  <b>Lizenz</b><span>{item.data.museum},
                    {item.data.fotograf},
                    <a
                      href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                      target="_blank">CC BY-NC-SA 4.0</a></span>
                </p>
                <p class="sobjects">
                  <span
                    class="link"
                    on:click|preventDefault={() => link(item.id, true)}>
                    <img alt="ähnliche Objekte" src="liste.png" />
                    <span>Zeige ähnliche Objekte als Pfad</span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="row distance" style="height: 45px">
          {#if id != 'suche'}
            <svg
              style="height: 60px;width: {5 + item.distance * 3}px; left:{-(item.distance * 3)}px; top:-10px">
              <path
                style="fill:none; stroke-width:2px; stroke:#515151;"
                d="
            M{2 + item.distance * 3} 0
            C {2 + item.distance * 3} 15
            2 15
            2 30
            C 2 45
            {2 + item.distance * 3} 50
            {2 + item.distance * 3} 60
          " />
            </svg>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
