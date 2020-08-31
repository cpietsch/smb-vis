<script>
  import { onDestroy, getContext } from "svelte";
  import { Container } from "pixi.js";
  import { dimensions, sprites } from "./stores.js";
  import { zoom as d3zoom } from "d3-zoom";
  import { select } from "d3-selection";

  const { renderer, container, outerContainer } = getContext("renderer")();

  const zoom = d3zoom().scaleExtent([1, 9]).clickDistance(2).on("zoom", zoomed);

  function zoomed({ transform }) {
    // console.log(transform);
    container.scale.set(transform.k);
    container.position.x = transform.x;
    container.position.y = transform.y;
    renderer.render(container);
  }

  select(outerContainer).call(zoom);

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
