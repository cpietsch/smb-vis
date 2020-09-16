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
  import { flip } from "svelte/animate";

  import { zoomIdentity } from "d3-zoom";

  let outerContainer;
  let mapped;
  let animate = false;

  //   setTimeout(() => {
  //     animate = true;
  //   }, 300);

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
      const id = d.id;
      const x = transform.applyX(d.x);
      const y = transform.applyY(d.y);
      const sprite = $sprites.get(d.id);
      const texture = sprite.texture;
      const frame = texture.frame;
      const src = texture.baseTexture.resource.source.src;
      return { frame, src, x, y, id };
    });

    console.log(mapped, items);
  }

  function style(item) {
    return `width:${item.frame.width}px;
        height:${item.frame.height}px;
        transform: translate(${item.x}px,${item.y}px) scale(0.1);
        background: url(${item.src});
        background-position: -${item.frame.x}px -${item.frame.y}px;
        position: absolute;
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
    transition: transform 1s;
    display: inline-block;
    transform-origin: 0 0;
  }
</style>

<div class="outer" on:click={() => (animate = !animate)}>
  <div class="liste" bind:this={outerContainer} class:list={animate}>
    {#each mapped as item (item.id)}
      <div class="image" animate:flip style={style(item)} />
    {/each}
  </div>
</div>
