<script>
  import { onMount, setContext } from "svelte";
  import { Renderer, Container } from "pixi.js";
  import { dimensions, sprites } from "./stores.js";

  console.log("renderer");
  let canvas;
  let outerContainer;
  let renderer;
  let container = new Container();
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
      resolution: window.devicePixelRatio,
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
      //cancelAnimationFrame(frame);
      for (const sprite of sprites.values()) {
        container.removeChild(sprite);
      }
      container.destroy();
      renderer.destroy();
      resizeObserver.disconnect();
    };
  });

  // let frame;
  // (function loop() {
  //   frame = requestAnimationFrame(loop);
  //   const x = (1.5 + Math.sin(window.performance.now() / 1000)) * 4;
  //   container.scale.set(x);
  //   renderer.render(container);
  // })();
</script>

<style>
  .renderer {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<div class="renderer" bind:this={outerContainer}>
  <canvas bind:this={canvas} />
  {#if renderer}
    <slot />
  {/if}
</div>
