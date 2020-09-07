<script>
  import { onMount, getContext, setContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { quadtree as d3quadtree } from "d3-quadtree";
  import {
    scales,
    umapData,
    dimensions,
    sprites,
    selectedItem,
    distances,
    state,
    umapProjection,
    spriteScale,
    lastTransfrom,
  } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { interpolate as d3interpolate } from "d3-interpolate";
  import { get } from "svelte/store";
  import { zoom as d3zoom, zoomTransform, zoomIdentity } from "d3-zoom";
  import { extent } from "d3-array";
  import { xml } from "d3-fetch";

  const { renderer, container, outerContainer } = getContext("renderer")();
  const distanceCutoff = 5;
  const maxZoom = 20;
  let lastTransform = zoomIdentity;
  let stale = false;
  let lastSelected;

  $: zoom = d3zoom()
    .scaleExtent([1, maxZoom])
    .translateExtent([
      [0, 0],
      [$dimensions.width, $dimensions.height],
    ])
    .clickDistance(2)
    .filter((e) => !stale)
    .on("zoom", zoomed)
    .on("end", end);

  $: selection = select(outerContainer)
    .call(zoom)
    .on("click", click)
    .on("pointermove", mousemove);

  // console.log($dimensions);
  // test("HALLLOO");

  let lastProjection = $umapProjection;

  let quadtree = d3quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll($umapProjection);

  // state.subscribe((state) => {
  //   console.log("state", state);

  //   if (state === "cloud") {
  //     select(outerContainer).on("pointermove", mousemove);
  //   } else {
  //     select(outerContainer).on("pointermove", null);
  //     animateToList();
  //   }
  // });

  function animateToList() {}

  selectedItem.subscribe((selectedItem) => {
    // if( && lastTransform.k > 1)
    if (selectedItem) {
      const distance = $distances.get(selectedItem.id);

      const newProjection = $umapProjection.map((d) => {
        const alpha =
          distance && distance.distances.find((e) => e[0] == d.id) ? 1 : 0.2;
        const active = lastSelected ? lastSelected.id === d.id : false;
        return { ...d, scale: active ? $spriteScale * 1.2 : d.scale, alpha };
      });
      lastProjection = newProjection;
    } else {
      lastProjection = $umapProjection;
    }

    renderProjection(lastProjection);
  });

  function mousemove(e) {
    if (stale) return;
    const m = pointer(e);
    const p = zoomTransform(this).invert(m);
    let selected = quadtree.find(p[0], p[1]);
    if (!selected) return;
    const distance = Math.hypot(p[0] - selected.x, p[1] - selected.y);

    if (distance > distanceCutoff) {
      selected = null;
    }
    selection.style("cursor", selected ? "pointer" : "auto");

    if (lastSelected !== selected) {
      lastSelected = selected;
      selectedItem.set(lastSelected);
    }
  }

  function renderProjection(projection) {
    console.log("render");
    for (const d of projection) {
      const s = $sprites.get(d.id);
      if (!s) {
        console.log("not found", d.id);
        return;
      }
      s.position.x = d.x;
      s.position.y = d.y;
      s.alpha = d.alpha;
      s.scale.set(d.scale);
      s.zIndex = d.zIndex;
      s.visible = d.visible;
    }
    renderer.render(container);
  }

  // ZOOM

  function resetZoom() {
    stale = true;
    return selection
      .transition()
      .duration(1000)
      .call(zoom.transform, zoomIdentity)
      .on("end", () => (stale = false));
  }

  function zoomToPos(x, y, scale) {
    stale = true;
    return selection
      .transition()
      .duration(1000)
      .call(zoom.scaleTo, scale, lastTransform.apply([x, y]))
      .on("end", () => (stale = false));
  }

  function fadeOutOthers() {
    const distance = $distances.get($selectedItem.id);
    return selection
      .transition()
      .duration(1000)
      .tween("list", function () {
        const newProjection = $umapProjection.map((d) => {
          const alpha =
            distance && distance.distances.find((e) => e[0] == d.id) ? 1 : 0;
          return { ...d, scale: $spriteScale, alpha };
        });
        const interpolate = d3interpolate(lastProjection, newProjection);
        return function (t) {
          lastProjection = interpolate(t);
          renderProjection(lastProjection);
        };
      })
      .end();
  }

  function zoomToExtend() {
    stale = true;
    const { width, height } = $dimensions;
    const { x, y, id } = $selectedItem;
    const distance = $distances.get(id);

    const items = $umapProjection.filter(
      (d) => distance && distance.distances.find((e) => e[0] == d.id)
    );
    const [x0, x1] = extent(items, (d) => d.x);
    const [y0, y1] = extent(items, (d) => d.y);
    console.log(x0, x1, y0, y1);
    console.log(items);

    return selection
      .transition()
      .duration(1500)
      .call(
        zoom.transform,
        zoomIdentity
          .translate(width / 2, height / 2)
          .scale(
            Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
          )
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        [x, y]
      )
      .end();
  }

  function click() {
    if (stale) return;
    if ($selectedItem === null) {
      return resetZoom();
    }
    if (lastTransform.k == maxZoom) {
      return zoomToExtend()
        .then(fadeOutOthers)
        .then((d) => {
          // console.log(d);
          // stale = false;
          state.set("list");
        });
    }

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
    lastTransfrom.set({ ...transform });
  }
</script>

<slot />
