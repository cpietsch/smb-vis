<script>
  import { onMount, setContext } from "svelte";
  import { Renderer, Container } from "pixi.js";
  import { dimensions } from "./stores.js";

  console.log("renderer");
  let canvas;
  let outerContainer;
  let renderer;
  let width;
  let height;

  let container = new Container();
  let backgroundColor = 0xeeeeee;

  setContext("renderer", () => ({
    renderer,
    width,
    height,
    container,
  }));

  onMount(() => {
    let boundingRect = outerContainer.getBoundingClientRect();
    width = parseInt(boundingRect.width);
    height = parseInt(boundingRect.height);

    const resizeObserver = new ResizeObserver(([entry]) => {
      width = parseInt(entry.contentRect.width);
      height = parseInt(entry.contentRect.height);
      renderer.resize(width, height);
      // console.log("resizeObserver", width, height);
    });
    resizeObserver.observe(outerContainer);

    renderer = new Renderer({
      view: canvas,
      width,
      height,
      antialias: false,
      transparent: false,
      resolution: 1,
      backgroundColor,
    });
    renderer.render(container);

    // let frame;
    // (function loop() {
    //   frame = requestAnimationFrame(loop);
    //   const x = (1.5 + Math.sin(window.performance.now() / 1000)) * 4;
    //   container.scale.set(x);
    //   renderer.render(container);
    // })();

    return () => {
      cancelAnimationFrame(frame);
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
</style>

<!-- svelte-ignore non-top-level-reactive-declaration -->
<!-- svelte-ignore non-top-level-reactive-declaration -->
<div class="renderer" bind:this={outerContainer}>
  <canvas bind:this={canvas} {width} {height} />
  {#if renderer}
    <slot />
  {/if}
</div>
