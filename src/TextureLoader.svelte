<script>
  import { onDestroy, getContext, setContext } from "svelte";
  import { getTextureStream } from "./utils/textureloader.js";
  import {
    renderer as pixiRenderer,
    container as pixiContainer,
    sprites,
  } from "./stores.js";
  import { get } from "svelte/store";

  let loading = true;
  let loaded = 0;

  const url =
    "https://vikusviewer.fh-potsdam.de/smb/beide/data/sprites-jpg/web_web_full.json";

  // const { renderer, container } = getContext("renderer")();

  const renderer = get(pixiRenderer);
  const container = get(pixiContainer);
  const textures = new Map();

  (async () => {
    console.log("textzreloader§", renderer);
    const textureStream = getTextureStream(url);

    for await (const [id, texture] of textureStream) {
      textures.set(id, texture);
      const sprite = $sprites.get(id);
      if (sprite) sprite.texture = texture;
      if (++loaded % 300 === 0) renderer.render(container);
    }
    renderer.render(container);
    loading = false;
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

{#if loading}
  <div>LOADING! {loaded}</div>
{:else}
  <slot />
{/if}
