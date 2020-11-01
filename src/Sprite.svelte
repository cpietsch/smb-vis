<script>
  // made by christopher pietsch chrispie.com 2020
  import { onMount } from "svelte";
  import {
    distancesCutoffScore,
    selectedItem,
    darkmode,
    history,
    anchor,
    searchstring,
    // searchItems,
    lastTransformed,
    searchResults,
    sprites,
    renderer,
    texturesLoaded,
  } from "./stores.js";
  import { RenderTexture, Sprite } from "pixi.js";
  import { createEventDispatcher } from "svelte";

  // does git username now works ?
  const dispatch = createEventDispatcher();

  export let id;
  export let style;
  let loaded = false;
  let canvas;
  let container;
  let w, h;

  function loadTexture() {
    console.time("TEXTURE");
    const origSprite = $sprites.get(id);
    // console.log(origSprite)
    const sprite = new Sprite.from(origSprite.texture);
    w = origSprite.texture.width;
    h = origSprite.texture.height;
    // sprite.scale.x = sprite.scale.y = 1
    // sprite.position.x = w / 2
    // sprite.position.y = h / 2
    // console.log(sprite)
    const renderTexture = RenderTexture.create({ width: w, height: h });
    $renderer.render(sprite, renderTexture);
    const image = $renderer.plugins.extract.canvas(renderTexture);
    // console.log(renderTexture)
    // console.log(image)
    container.appendChild(image);
    loaded = true;
    dispatch("load", {
      w,
      h,
    });
    console.timeEnd("TEXTURE");
  }

  $: {
    if ($texturesLoaded && !loaded && container) {
      loadTexture();
    }
  }

  onMount(() => {
    if ($texturesLoaded && !loaded) {
      loadTexture();
    }
    return () => {};
  });
</script>

<style>
  :global(.dynamicsprite canvas) {
    width: 100%;
  }
  :global(.dynamicsprite.transition canvas) {
    position: absolute;
  }
  .transition {
    transition: transform 3s, width 3s, height 3s;
    transition-timing-function: ease-in-out;
    position: absolute;
  }
</style>

<div
  bind:this={container}
  class="dynamicsprite"
  class:transition={style}
  {style} />
<!-- <canvas bind:this={canvas} width={w} height={h}></canvas> -->
