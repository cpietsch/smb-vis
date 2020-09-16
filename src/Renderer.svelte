<script>
  import { onMount, setContext } from "svelte";
  import { Renderer, Container } from "pixi.js";
  import { dimensions, sprites, state } from "./stores.js";

  console.log("renderer");
  let canvas;
  let outerContainer;
  let renderer;
  let container = new Container();
  container.sortableChildren = true;

  let backgroundColor = 0xeeeeee;

  setContext("renderer", () => ({
    renderer,
    container,
    outerContainer,
  }));

  dimensions.subscribe(({ width, height }) => {
    if (!renderer) return;
    renderer.resize(width, height);
    renderer.render(container);
  });

  sprites.subscribe((sprites) => {
    for (const sprite of sprites.values()) {
      container.addChild(sprite);
    }
  });

  function createRenderer(width, height) {
    return new Renderer({
      view: canvas,
      width,
      height,
      antialias: false,
      transparent: false,
      autoDensity: true,
      resolution: 1,
      //resolution: window.devicePixelRatio,
      backgroundColor,
    });
  }

  onMount(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = parseInt(entry.contentRect.width);
      const height = parseInt(entry.contentRect.height);

      if (!renderer) renderer = createRenderer(width, height);

      dimensions.set({
        width,
        height,
      });
    });
    resizeObserver.observe(outerContainer);

    return () => {
      for (const sprite of $sprites.values()) {
        container.removeChild(sprite);
      }
      container.destroy();
      renderer.destroy();
      resizeObserver.disconnect();
    };
  });
</script>

<style>
  .renderer {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .hide {
    display: none;
  }

  canvas {
    position: absolute;
  }
</style>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<div class="renderer" bind:this={outerContainer}>
  <canvas bind:this={canvas} />
  {#if renderer}
    <slot />
  {/if}
</div>
