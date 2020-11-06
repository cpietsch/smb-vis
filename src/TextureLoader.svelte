<script>
  // made by christopher pietsch chrispie.com 2020
  import { onDestroy, getContext, setContext } from "svelte";
  /*
  import 'core-js/symbol'
  import 'core-js/modules/es7.symbol.async-iterator'
  */
  import { getTextureStreamCallback } from "./utils/textureloader.js";
  import {
    renderer as pixiRenderer,
    container as pixiContainer,
    sprites,
    texturesLoaded,
  } from "./stores.js";
  import { get } from "svelte/store";

  let loading = true;
  let loaded = 0;

  const url = "data/sprites/web_web_full.json";

  const renderer = get(pixiRenderer);
  const container = get(pixiContainer);
  const textures = new Map();

  (async () => {
    console.log("textzreloader", renderer);
    const textureStream = await getTextureStreamCallback(url, ([id, texture]) => {
      textures.set(id, texture);
      const sprite = $sprites.get(id);
      if (sprite) sprite.texture = texture;
      if (++loaded % 300 === 0) {
        renderer.render(container);
      }
    });
   
    // this does not work in old browser and no polyfill changes that
    /*
    const textureStream = getTextureStream(url)
    for await (const [id, texture] of textureStream) {
      console.log(a)
    textures.set(id, texture);
    const sprite = $sprites.get(id);
    if (sprite) sprite.texture = texture;
    if (++loaded % 300 === 0) renderer.render(container);
    }
    */
    renderer.render(container);
    loading = false;
    texturesLoaded.set(true);
  })();

  $: {
    console.log(loading);
    console.log(container.children.length);
  }

  onDestroy(() => {
    for (const texture of textures.values()) {
      texture.destroy();
    }
  });
</script>

{#if !loading}
  <slot />
{/if}
