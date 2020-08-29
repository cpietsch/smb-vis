<script>
  import { onMount, setContext } from "svelte";
  import { Renderer, Container } from "pixi.js";

  console.log("renderer");
  let canvas;
  let renderer;
  let container = new Container();

  export let width = 500;
  export let height = 500;

  setContext("renderer", () => ({
    renderer,
    width,
    height,
    container,
  }));

  onMount(() => {
    renderer = new Renderer({
      view: canvas,
      width: width,
      height: height,
    });

    let frame;
    (function loop() {
      frame = requestAnimationFrame(loop);
      const x = (1.5 + Math.sin(window.performance.now() / 1000)) * 4;
      container.scale.set(x);
      renderer.render(container);
    })();

    return () => {
      cancelAnimationFrame(frame);
      container.destroy();
      renderer.destroy();
    };
  });
</script>

<style>

</style>

<div class="renderer">
  <canvas bind:this={canvas} />
  {#if renderer}
    <slot />
  {/if}
</div>
