<script>
  import { onMount, setContext } from "svelte";
  import {
    dimensions,
    sprites,
    selectedItem,
    distances,
    umapProjection,
    lastTransfrom,
  } from "./stores.js";
  import { get } from "svelte/store";

  import { zoomIdentity } from "d3-zoom";

  let outerContainer;
  let mapped;

  $: {
    const { x, y, k } = $lastTransfrom;
    console.log(x, y, k);
    const transform = zoomIdentity.translate(x, y).scale(k);
    const { id } = $selectedItem;
    const distance = $distances.get(id);
    const items = $umapProjection.filter(
      (d) => distance && distance.distances.find((e) => e[0] == d.id)
    );
    mapped = items.map((d) => {
      const x = transform.applyX(d.x);
      const y = transform.applyY(d.y);
      const sprite = $sprites.get(d.id);
      const texture = sprite.texture;
      const frame = texture.frame;
      const src = texture.baseTexture.resource.source.src;
      return { frame, src, x, y };
    });

    console.log(mapped, items);
  }

  onMount(() => {
    return () => {};
  });
</script>

<style>
  .list {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
    display: flex;
    z-index: 10;
  }
  .image {
    width: 10px;
    height: 10px;
    background: #000;
    position: absolute;
    display: inline-block;
    transform-origin: 0 0;
  }
</style>

<div class="list" bind:this={outerContainer}>
  {#each mapped as item}
    <div
      class="image"
      style="
      width:{item.frame.width}px;
      height:{item.frame.height}px;
      transform: translate({item.x}px,{item.y}px) scale(0.1);
      background: url({item.src});
      background-position: -{item.frame.x}px -{item.frame.y}px;
    " />
  {/each}
</div>
