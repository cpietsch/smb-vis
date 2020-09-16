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
  let stale = true;

  $: zoom = d3zoom()
    .scaleExtent([1, maxZoom])
    .translateExtent([
      [0, 0],
      [$dimensions.width, $dimensions.height],
    ])
    .clickDistance(2)
    .filter((e) => stale)
    .on("zoom", zoomed)
    .on("end", end);

  $: selection = select(outerContainer).call(zoom).on("click", click);

  function resetZoom() {
    stale = false;
    return selection
      .transition()
      .duration(1000)
      .call(zoom.transform, zoomIdentity)
      .on("end", () => (stale = true));
  }

  function zoomToPos(x, y, scale) {
    stale = false;
    return selection
      .transition()
      .duration(1000)
      .call(zoom.scaleTo, scale, lastTransform.apply([x, y]))
      .on("end", () => (stale = true));
  }

  function zoomToExtend() {}

  function click() {
    if ($selectedItem === null) {
      return resetZoom();
    }
    // if (lastTransform.k == maxZoom) {
    //   console.log("make animation");
    //   state.set("list");

    //   return;
    // }

    if (lastTransform.k !== maxZoom) {
      return zoomToPos($selectedItem.x, $selectedItem.y, maxZoom);
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

<slot />
