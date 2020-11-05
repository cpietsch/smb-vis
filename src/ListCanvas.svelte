<script>
  // made by christopher pietsch chrispie.com 2020
  import { onMount, setContext, tick } from "svelte";
  import Header from "./Header.svelte";
  import Sprite from "./Sprite.svelte";

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
    route,
    experimental,
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
  let lastCurrent = current;
  let large = false;
  let animating = false;
  let transition = 0;
  let container;
  let showMouseOver = false;
  let maxSearchResults = 100;

  const fields = [
    ["idnr", "Ident.Nr."],
    ["actors", "Beteiligte"],
    ["ort", "Geographische Bezüge"],
    ["datum", "Datierung"],
    ["material", "Material und Technik"],
    ["abmessung", "Abmessungen und Gewicht"],
  ];

  console.log("hello from list", id);

  const baseUrl = "https://vikusviewer.fh-potsdam.de/smb/beide/data/";

  let items = [];

  async function link(id, internal) {
    if (!internal) {
      window.scrollTo({ top: 0 });
      window.location.hash = "#/cloud/" + id;
      setTimeout(() => searchstring.set(""), 100);
      return;
    }

    animating = true;
    scrollTo(0);
    // window.scrollTo({ top: 0, behavior: "smooth" });
    window.location.hash = "#/list/" + id;
    setTimeout(() => (animating = false), 1000);
    return false;
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
    // if(id !== )
    console.log("scroll", id, current);
    const div = container.querySelector("#l" + id);
    setTimeout(() => {
      const rect = div.getBoundingClientRect();
      if (rect.top < 0) {
        scrollTo(container.scrollTop + rect.top - 20, 400);
      }
      //.scrollIntoView()
    }, 502);
  }

  $: res = transition > 2 ? "1024" : "256";
  $: loading = transition > 2 ? "lazy" : "eager";

  $: {
    // console.log("current", current);
    if (lastCurrent != current && current) {
      scroll(current);
      lastCurrent = current;
    }
  }
  $: {
    if (id === "suche") {
      console.log($searchResults);
      items = $searchResults
        .map((id, i) => {
          const data = $detailData.get(id);
          const projection = $umapProjection.find((d) => d.id === id);
          return { id, i, score: 1, data, distance: 10, projection };
        })
        .filter((d) => d.projection)
        .filter((a, i) => i < maxSearchResults);
      console.log(items);
      current = undefined;
    } else {
      const distances = $getSelectedDistances(id);

      items = distances
        .map(([id, score], i) => {
          let distance = 0;
          if (i < distances.length - 1) {
            distance = score - distances[i + 1][1];
          }
          const data = $detailData.get(id);
          const projection = $umapProjection.find((d) => d.id === id);
          return { id, score, data, distance, i, projection };
        })
        .filter((d) => d.projection);
    }

    // console.log(items);
  }

  let loadedMap = [];
  let loadedAll = false;

  function loaded(e, sid) {
    if (loadedAll) return;
    loadedMap.push(sid);
    if (loadedMap.length === items.length) loadedAll = true;
  }

  // $: loadedAll = loadedMap.length > 0 && loadedMap.length === items.length
  $: {
    console.log("loadedAll", loadedAll, $route, $route.transition);
    if (loadedAll && $route.transition == "cloud-list") {
      domBoxes = getDomBoxes();
      console.log("domBoxes", domBoxes);

      canvasBoxes = getCanvasBoxes();
      console.log("canvasBoxes", canvasBoxes);

      transition = 1;
      setTimeout(() => (transition = 2), 100);
      setTimeout(() => (transition = 3), 2100);
    }
    if ($route.transition === undefined) {
      transition = 3;
    }
  }

  let domBoxes = [];
  let canvasBoxes = [];

  function getDomBoxes() {
    return items.map(({ id, i }) => {
      const pic = container
        .querySelector("#l" + id)
        .querySelector(".picture img");
      const { x, y, width, height } = pic.getBoundingClientRect();
      return { id, i, x, y, width, height };
    });
  }

  function getCanvasBoxes() {
    const { x, y, k } = $lastTransformed;
    const transform = zoomIdentity.translate(x, y).scale(k);
    return items.map((d, i) => {
      const id = d.id;
      const sprite = $sprites.get(d.id);
      // console.log(d, d.id, sprite);
      const { width, height } = sprite;
      const w = width * transform.k;
      const h = height * transform.k;
      const x = transform.applyX(d.projection.x) - w / 2;
      const y = transform.applyY(d.projection.y) - h / 2;
      return { id, i, x, y, width: w, height: h };
    });
  }

  function domStyle(item) {
    return `width:${item.width}px;
            height:${item.height}px;
            transform: translate(${item.x}px,${item.y}px);
            z-index:${100 - item.i};
            `;
    //transition-delay: ${item.i * 0.01}s;
  }

  function canvasStyle(id) {
    const item = canvasBoxes.find((d) => d.id === id);
    return `width:${item.width}px;
            height:${item.height}px;
            transform: translate(${item.x}px,${item.y}px);`;
  }

  onMount(async () => {
    //   await tick()

    return () => {};
  });
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
    position: absolute;

    top: 0;

    overflow-y: scroll;
    overflow-x: hidden;

    justify-content: center;
    display: flex;
    color: #515151;
    transition: background 0s;
    transition-delay: 0.1s;
  }

  .container.active {
    background: #eeeeee;
  }

  .dark,
  .container.active.dark {
    background: #232323;
    color: #cecece;
  }

  .transition {
    position: absolute;
    /* overflow: hidden; */
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: none;
  }
  .transition.active {
    display: block;
  }

  .transition img {
    position: absolute;
    transition: transform 2s, width 2s, height 2s;
    transition-timing-function: ease-in-out;
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
    visibility: hidden;
  }
  .liste.active {
    visibility: visible;
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
    user-select: none;
  }
  .picture picture {
    z-index: 100;
    width: 100%;
    user-select: none;
  }
  .picture img {
    width: 100%;
    user-select: none;
  }
  /* :global(.picture canvas) {
      width: 100%;
    }
   */
  .selected {
    z-index: 100;
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
    /* visibility: hidden; */
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
    background: #232323;
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
    /* font-size: 0.9em; */
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
    background: linear-gradient(to left, rgb(0 0 0 / 31%), rgba(0, 0, 0, 0));
    box-shadow: inset 55px -124px 114px -18px rgb(35 35 35);
  }

  .center {
    position: absolute;
    cursor: pointer;
    align-items: center;
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

  .dark .arrow {
    border: solid white;
    border-width: 0 3px 3px 0;
  }

  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 5px;
    margin-right: 4px;
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
    display: flex;
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
    width: 170px;
    min-width: 170px;
  }

  .item:last-child .distance {
    display: none;
  }

  .distance {
    opacity: 1;
    transition: visibility 0s, opacity 1s;
    position: relative;
  }

  .distance svg {
    position: relative;
    background-color: none;
    z-index: 2;
  }

  .mouseoverdistance {
    position: absolute;
    left: 5px;
    top: 5px;
    width: 40%;
    background: white;
    border-radius: 6px;
    padding: 10px;
    z-index: 200;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    pointer-events: none;
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
    padding-left: 15px;
    padding-right: 15px;
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

<div
  class="container"
  bind:this={container}
  class:dark={$darkmode}
  class:active={transition > 1}>
  <!-- <Header /> -->
  <div class="transition" class:active={transition != 3}>
    {#each domBoxes as item (item.id)}
      {#if !$experimental}
        <img
          src="{baseUrl}256/{item.id}.jpg"
          alt=""
          style={transition == 1 ? canvasStyle(item.id) : domStyle(item)} />
      {:else}
        <Sprite
          id={item.id}
          style={transition == 1 ? canvasStyle(item.id) : domStyle(item)} />
      {/if}
    {/each}
  </div>
  <div class="liste" class:animating class:active={transition == 3}>
    {#each items as item (item.id)}
      <div
        class="item"
        id="l{item.id}"
        class:large={item.id === current && large}
        class:current={item.id === id}
        class:selected={item.id === current}>
        <!-- animates:flip={{ duration: 1000, easing: cubicInOut }} -->
        <div class="row detail" on:click={(e) => (current = item.id)}>
          <div class="picture">
            <picture
              draggable="false"
              on:click={() => ((large = current === item.id ? !large : false), (current = item.id))}>
              <!-- <source srcset="{baseUrl}1024/{item.id}.jpg 1024w" > -->
              <!-- {#if transition == 3}
                <img
                  loading="lazy"
                  src="{baseUrl}1024/{item.id}.jpg"
                  alt={item.data._titel} />
              {/if} -->
              {#if !$experimental}
                <img
                  draggable="false"
                  on:load={(e) => loaded(e, item.id)}
                  {loading}
                  src="{baseUrl}{res}/{item.id}.jpg"
                  alt={item.data._titel} />
              {:else}
                <Sprite id={item.id} on:load={(e) => loaded(e, item.id)} />
              {/if}
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
                on:clicks={(e) => ((large = false), (current = current === item.id ? undefined : item.id))}>
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
                  <b>Lizenz</b><span>{item.data.sammlunglong
                      .split(',')
                      .reverse()
                      .join(', ')},
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
              on:mouseover={() => (showMouseOver = item.id)}
              on:mouseleave={() => (showMouseOver = false)}
              style="height: 60px;width: {5 + item.distance * 3}px; left:{-(item.distance * 3)}px; top:-10px">
              <path
                style="fill:none; stroke-width:2px; stroke:rgb(162 162 162);"
                d={svgPath(item.distance)} />
            </svg>
            {#if showMouseOver == item.id}
              <div class="mouseoverdistance">
                Je größer der Ausschlag, desto weiter entfernt und somit
                unähnlicher ist das nächste Objekt zum oben ausgewählten Objekt.
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
