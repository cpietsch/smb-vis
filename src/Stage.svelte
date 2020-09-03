<script>
  import { onDestroy, getContext } from "svelte";
  import { Container } from "pixi.js";
  import {
    dimensions,
    umapData,
    transfrom,
    selectedItem,
    state,
  } from "./stores.js";
  import { distanceTensors } from "./distances.js";
  import { zoom as d3zoom, zoomTransform, zoomIdentity } from "d3-zoom";
  import { select } from "d3-selection";

  const { renderer, container, outerContainer } = getContext("renderer")();

  const maxZoom = 20;
  let lastTransform = zoomIdentity;

  $: zoom = d3zoom()
    .scaleExtent([1, maxZoom])
    .translateExtent([
      [0, 0],
      [$dimensions.width, $dimensions.height],
    ])
    .clickDistance(2)
    .on("zoom", zoomed)
    .on("end", end);

  $: selection = select(outerContainer).call(zoom).on("click", click);

  // $: console.log($distanceTensors);

  function click() {
    if ($selectedItem === null) {
      selection.transition().duration(1000).call(zoom.transform, zoomIdentity);
      return;
    }
    if (lastTransform.k == maxZoom) {
      console.log("make animation");
      state.set("list");
      return;
    }
    if (lastTransform.k !== maxZoom) {
      selection
        .transition()
        .duration(1000)
        .call(
          zoom.scaleTo,
          maxZoom,
          lastTransform.apply([$selectedItem.x, $selectedItem.y])
        );
    }
  }
  function zoomed({ transform }) {
    lastTransform = transform;
    container.scale.set(transform.k);
    container.position.x = transform.x;
    container.position.y = transform.y;
    renderer.render(container);
  }

  function end({ transform }) {
    transfrom.set({ ...transform });
  }
</script>

{#if $umapData.length}
  <slot />
{/if}
