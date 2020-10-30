<script>
  // made by christopher pietsch chrispie.com 2020
  import { onMount, setContext, tick } from "svelte";
  import Header from "./Header.svelte";

  import {
    dimensions,
    sprites,
    selectedItem,
    getSelectedDistances,
    umapProjection,
    darkmode,
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

  async function link(id, internal) {
    if (!internal) {
      window.scrollTo({ top: 0 });
      window.location.hash = "#/cloud/" + id;
      return;
    }

    animating = true;
    scrollTo(0);
    // window.scrollTo({ top: 0, behavior: "smooth" });
    window.location.hash = "#/list/" + id;
    setTimeout(() => (animating = false), 1000);
  }

  function scrollTo(to, duration = 1000) {
    console.log("scrollTo", to);
    return selection()
      .transition("scroll")
      .duration(duration)
      .ease(cubicInOut)
      .tween("scroll", function () {
        const scroll = interpolateNumber(container.scrollTop, to);
        return function (t) {
          container.scrollTop = scroll(t);
        };
      });
  }

  function svgPath(distance) {
    return `
            M${2 + distance * 3} 0
            C ${2 + distance * 3} 15
            2 15
            2 30
            C 2 45
            ${2 + distance * 3} 50
            ${2 + distance * 3} 60
          `;
  }

  function scroll(id) {
    const div = container.querySelector("#l" + id);
    setTimeout(() => {
      const rect = div.getBoundingClientRect();
      if (rect.top < 0) {
        scrollTo(container.scrollTop + rect.top - 20, 400);
      }
      //.scrollIntoView()
    }, 502);
  }

  function loaded(e, sid) {
    if (sid === id) {
      console.log("LOADED", e, e.target.getBoundingClientRect());
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

    // console.log(items);
  }

  // function loaded(e){
  //   console.log("!!!!!loaded", e)
  // }

  onMount(async () => {
    await tick();
    const pic = container.querySelector("#l" + id).querySelector(".picture");
    const box = pic.getBoundingClientRect();
    console.log("box", box);
    return () => {};
  });
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: #eeeeee;
    top: 0;

    overflow-y: scroll;
    overflow-x: hidden;

    justify-content: center;
    display: flex;
    color: #515151;
    visibility: hidden;
  }

  .dark {
    background-color: #000;
    color: #cecece;
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
  }
  .picture {
    cursor: pointer;
    position: relative;
    width: 100px;
    transition: width 0.5s;
    display: flex;
    z-index: 10;
  }
  .picture picture {
    z-index: 100;
  }
  .picture img {
    width: 100%;
  }

  .selected {
    z-index: 10;
  }
  .selected .picture {
    width: 50%;
    cursor: zoom-in;
  }

  .selected.large .picture {
    width: 1024px;
    max-width: 100%;
    max-height: 100%;
    cursor: zoom-out;
  }

  .selected.large .meta {
    visibility: hidden;
    transition: none;
  }
  .selected.large .additional {
    visibility: hidden;
    transition: none;
  }

  .additional {
    opacity: 0;
    flex-direction: column;
    visibility: hidden;
  }
  .additional .beschreibung {
    display: block;
  }
  .selected .additional {
    display: flex;

    opacity: 1;
    /* visibility: visible; */
    transition: visibility 0s, opacity 0.5s;
    transition-delay: 0.5s;
  }
  .dark .metacontainer,
  .dark .selected .meta {
    background: #000;
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
    transition: visibility;
    /* transition-delay: 0.5s; */
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

  .dark .selected .meta::before {
    background: linear-gradient(
      to left,
      rgba(255, 255, 255, 0.2),
      rgba(0, 0, 0, 0)
    );
    /* box-shadow: none; */
    box-shadow: inset 55px -124px 114px -18px rgb(0, 0, 0);
  }

  .center {
    position: absolute;
    cursor: pointer;
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

  .dark .center {
    background-color: #525252;
  }

  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 5px;
    position: relative;
  }

  .left {
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
  }

  .right {
    transform: rotate(-135deg);
    -webkit-transform: rotate(-135deg);
    top: 3px;
  }

  .selected .center {
    display: inline;
  }

  h2 {
    font-size: 1em;
    cursor: pointer;
    width: 30%;
  }
  .selected h2 {
    white-space: inherit;
    width: inherit;
    font-size: 1.3em;
    margin-top: 0.5em;
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
    position: relative;
    background-color: none;
    z-index: 2;
  }

  .animating .distance {
    visibility: hidden;
    opacity: 0;
  }

  .metacontainer a {
    color: #515151;
  }

  .current .sobjects {
    display: none;
  }

  .link {
    cursor: pointer;
    display: flex;
    background: white;
    border-radius: 6px;
    padding: 10px;
    align-items: center;
  }
  .link:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  .link img {
    margin-right: 1em;
  }
  .link span {
    margin-left: 10px;
  }
  .dark .link {
    background-color: #525252;
  }
</style>

<!-- <svelte:window on:load={loaded}/> -->

<div class="container" bind:this={container} class:dark={$darkmode}>
  <Header />
  <div class="liste" class:animating>
    {#each items as item (item.id)}
      <div
        class="item"
        id="l{item.id}"
        class:large={item.id === current && large}
        class:current={item.id === id}
        class:selected={item.id === current}>
        <!-- animates:flip={{ duration: 1000, easing: cubicInOut }} -->
        <div
          class="row detail"
          on:click={(e) => ((current = item.id), scroll(current))}>
          <div class="picture">
            <picture
              loading="lazy"
              on:click={() => ((large = current === item.id ? !large : false), (current = item.id), scroll(current))}>
              <img
                on:load={(e) => loaded(e, item.id)}
                loading="lazy"
                src="{baseUrl}{item.id}.jpg"
                alt={item.data._titel} />
            </picture>
            <div
              class="center"
              on:click|preventDefault={() => link(item.id, false)}>
              <div class="arrow left" />
              <span>Wolke</span>
            </div>
          </div>
          <div class="metacontainer">
            <div class="meta">
              <h2
                on:clicks={(e) => ((large = false), (current = current === item.id ? undefined : item.id), scroll(current))}>
                {item.data.titel}
              </h2>
              <div class="additional">
                <p class="beschreibung">{item.data.beschreibung}</p>
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
                    <div class="arrow right" />
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
                d={svgPath(item.distance)} />
            </svg>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
