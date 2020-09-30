<script>
  import { onMount, setContext } from "svelte";
  import { Renderer, Container } from "pixi.js";
  import { dimensions, sprites, state, darkmode } from "./stores.js";

  console.log("renderer");
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

  const s1 = dimensions.subscribe(({ width, height }) => {
    if (!renderer) return;
    renderer.resize(width, height);
    renderer.render(container);
  });

  const s2 = sprites.subscribe((sprites) => {
    for (const sprite of sprites.values()) {
      container.addChild(sprite);
    }
  });

  // $: {
  //   if (renderer) {
  //     console.log($darkmode);
  //     const color = $darkmode ? backgroundColorDark : backgroundColorLight;
  //     renderer.backgroundColor = color;
  //     renderer.render(container);
  //   }
  // }

  const s3 = darkmode.subscribe((darkmode) => {
    if (!renderer) return;
    const color = darkmode ? backgroundColorDark : backgroundColorLight;
    renderer.backgroundColor = color;
    renderer.render(container);
  });

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
      console.log("destroy");

      // this needs to be done better
      s1();
      s2();
      s3();
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
