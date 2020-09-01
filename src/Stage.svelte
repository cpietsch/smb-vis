<script>
  import { onDestroy, getContext } from "svelte";
  import { Container } from "pixi.js";
  import { dimensions, sprites, transfrom } from "./stores.js";
  import { zoom as d3zoom } from "d3-zoom";
  import { select } from "d3-selection";

  const { renderer, container, outerContainer } = getContext("renderer")();

  const maxZoom = 20;

  $: zoom = d3zoom()
    .scaleExtent([1, maxZoom])
    .translateExtent([
      [0, 0],
      [$dimensions.width, $dimensions.height],
    ])
    .clickDistance(2)
    .on("zoom", zoomed)
    .on("end", end);

  $: select(outerContainer).call(zoom);

  function zoomed({ transform }) {
    container.scale.set(transform.k);
    container.position.x = transform.x;
    container.position.y = transform.y;
    renderer.render(container);
  }

  function end({ transform }) {
    transfrom.set({ ...transform });
  }

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
