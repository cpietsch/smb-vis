<script>
  import { onDestroy, getContext, setContext } from "svelte";
  import { getTextureStream } from "./utils/textureloader.js";
  import { Sprite } from "pixi.js";
  import { dimensions } from "./stores.js";

  let loading = true;
  let loaded = 0;
  let sprites = new Map();

  setContext("sprites", () => sprites);

  const url =
    "https://vikusviewer.fh-potsdam.de/smb/beide/data/sprites-jpg/web_web_full.json";

  const { renderer, container } = getContext("renderer")();
  const { width, height } = $dimensions;
  const textureStream = getTextureStream(url);

  (async () => {
    for await (const [id, texture] of textureStream) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.x = Math.random() * width;
      sprite.y = Math.random() * height;
      sprite.scale.set(0.1);
      container.addChild(sprite);
      sprites.set(id, sprite);
      loaded++;
    }
    renderer.render(container);
    loading = false;
  })();

  $: {
    console.log(loading);
    console.log(container.children.length);
  }

  onDestroy(() => {
    for (const sprite of sprites.values()) {
      container.removeChild(sprite);
      sprite.destroy(true, true);
    }
  });
</script>

{#if loading}
  <div>LOADING! {loaded}</div>
{:else}
  <slot />
{/if}
