<script>
  import { onDestroy, getContext } from "svelte";
  import { Container } from "pixi.js";
  import { dimensions, sprites } from "./stores.js";

  const { renderer, container } = getContext("renderer")();

  sprites.subscribe((sprites) => {
    for (const sprite of sprites.values()) {
      container.addChild(sprite);
    }
  });

  onDestroy(() => {
    for (const sprite of sprites.values()) {
      container.removeChild(sprite);
    }
  });
</script>

<slot />
