<script>
  // made by christopher pietsch chrispie.com 2020
  import { onMount, setContext } from "svelte";
  import { Renderer, Container } from "pixi.js";
  import {
    dimensions,
    sprites,
    state,
    darkmode,
    renderer,
    container,
    divContainer,
  } from "./stores.js";
  import { writable, derived, readable, get } from "svelte/store";

  console.log("init renderer");
  let canvas;
  let outerContainer;

  let c = new Container();
  c.sortableChildren = true;
  container.set(c);
  // container.sortableChildren = true;

  const renderPromise = writable(Promise);

  let backgroundColorLight = 0xeeeeee;
  let backgroundColorDark = 0x000000;

  // setContext("renderer", () => ({
  //   renderer,
  //   container,
  //   outerContainer,
  // }));

  $: divContainer.set(outerContainer);

  $: {
    console.log("add sprites", $container.children.length);
    for (const sprite of $sprites.values()) {
      $container.addChild(sprite);
    }
  }

  $: {
    if ($renderer) {
      console.log("set renderer", $renderer);
      const color = $darkmode ? backgroundColorDark : backgroundColorLight;
      const { width, height } = $dimensions;
      console.log(width, height, color);

      $renderer.backgroundColor = color;
      $renderer.resize(width, height);
      $renderer.render($container);
    }
  }

  const resizeObserver = new ResizeObserver(([entry]) => {
    const width = parseInt(entry.contentRect.width);
    const height = parseInt(entry.contentRect.height);

    console.log("resizeObserver", width, height);
    if (!get(renderer)) {
      renderer.set(createRenderer(canvas, width, height));
    }
    // if (!renderer) renderer = createRenderer(width, height);

    dimensions.set({
      width,
      height,
    });
  });

  function createRenderer(view, width, height) {
    return new Renderer({
      view,
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
    console.log("mount");

    resizeObserver.observe(outerContainer);
    //renderer.set(createRenderer(canvas))

    return () => {
      console.log("destroy renderer");

      for (const sprite of $sprites.values()) {
        $container.removeChild(sprite);
      }
      $container.destroy();
      $renderer.destroy();
      //$pixiRenderer.destroy()
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

<!-- svelte-ignores non-top-level-reactive-declaration -->
<div class="renderer" bind:this={outerContainer}>
  <canvas bind:this={canvas} />
  {#if $renderer}
    <slot />
  {/if}
</div>
