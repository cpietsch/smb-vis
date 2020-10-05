<script>
  import { onMount, setContext } from "svelte";
  import { Renderer, Container } from "pixi.js";
  import { dimensions, sprites, state, darkmode } from "./stores.js";

  console.log("init renderer");
  let canvas;
  let outerContainer;
  let renderer;
  let container = new Container();
  container.sortableChildren = true;

  let backgroundColorLight = 0xeeeeee;
  let backgroundColorDark = 0x000000;

  setContext("renderer", () => ({
    renderer,
    container,
    outerContainer,
  }));


  $: {
    for (const sprite of $sprites.values()) {
      container.addChild(sprite);
    }
  }

  $: {
    if (renderer) {
      console.log("darkmode", $darkmode);
      const color = $darkmode ? backgroundColorDark : backgroundColorLight;
      const { width, height } = $dimensions
      renderer.backgroundColor = color;
      renderer.resize(width, height);
      renderer.render(container);
    }
  }

  function createRenderer(width, height) {
    return new Renderer({
      view: canvas,
      width,
      height,
      antialias: false,
      transparent: false,
      autoDensity: true,
      // resolution: 1,
      resolution: window.devicePixelRatio,
      backgroundColor: backgroundColorLight,
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
      console.log("destroy renderer");

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
