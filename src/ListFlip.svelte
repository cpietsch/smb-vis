<script>
  import { onMount, setContext } from "svelte";
  import {
    dimensions,
    sprites,
    selectedItem,
    selectedDistances,
    umapProjection,
    lastTransformed,
    spriteScale,
    state,
  } from "./stores.js";
  import { get } from "svelte/store";
  import { flip } from "svelte/animate";

  import { zoomIdentity } from "d3-zoom";

  let outerContainer;
  let mapped;
  let animate = true;

  setTimeout(() => {
    animate = false;
  }, 500);

  function comeBack() {
    animate = true;
    setTimeout(() => {
      state.set("cloud");
    }, 3000);
  }

  $: {
    const { x, y, k } = $lastTransformed;
    console.log(x, y, k);
    const transform = zoomIdentity.translate(x, y).scale(k);
    const { id } = $selectedItem;
    const distances = $selectedDistances;
    console.log(distances);
    const items = distances.map((e) =>
      $umapProjection.find((d) => e[0] == d.id)
    );
    mapped = items.map((d, i) => {
      const id = d.id;
      const x = transform.applyX(d.x);
      const y = transform.applyY(d.y);
      const sprite = $sprites.get(d.id);
      const texture = sprite.texture;
      const frame = texture.frame;
      const src = texture.baseTexture.resource.source.src;
      return { frame, src, x, y, id, i };
    });

    console.log(mapped, items);
  }

  function style(item) {
    return `width:${item.frame.width}px;
          height:${item.frame.height}px;
          transform: translate(${
            item.x - ($spriteScale * $lastTransformed.k * item.frame.width) / 2
          }px,${
      item.y - ($spriteScale * $lastTransformed.k * item.frame.height) / 2
    }px) scale(${$spriteScale * $lastTransformed.k});
          background: url(${item.src});
          background-position: -${item.frame.x}px -${item.frame.y}px;
          position: absolute;
          transition-delay: ${item.i / 100}s;
          z-index: ${100 - item.i};
        `;
  }

  function style2(item) {
    return `width:${item.frame.width}px;
          height:${item.frame.height}px;
          transform: translate(${
            $dimensions.width / 2 - item.frame.width / 2
          }px,${
      128 / 2 + 50 + item.i * 128 - item.frame.height / 2
    }px) scale(1);
          background: url(${item.src});
          background-position: -${item.frame.x}px -${item.frame.y}px;
          position: absolute;
          transition-delay: ${item.i / 100}s;
          z-index: ${100 - item.i};
        `;
  }

  onMount(() => {
    return () => {};
  });
</script>

<style>
  .outer {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: absolute;
    background-color: #eeeeee;
  }

  .liste {
    width: 100%;
    position: absolute;
  }
  .list {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    z-index: 10;
  }
  .list .image {
    position: relative !important;
    transform: unset !important;
  }
  .image {
    background: #000;
    transition: transform 2s;
    transition-timing-function: ease-in-out;
    display: inline-block;
    transform-origin: 0 0;
  }
</style>

<div class="outer" on:click={() => comeBack()}>
  <div class="liste" bind:this={outerContainer} class:listss={animate}>
    {#each mapped as item (item.id)}
      <div class="image" style={animate ? style(item) : style2(item)} />
    {/each}
  </div>
</div>
