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
  } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { zoomTransform } from "d3-zoom";
  import { distanceTensors } from "./distances.js";
  import { get } from "svelte/store";

  // const distances = get(distanceTensors);

  const { renderer, container, outerContainer } = getContext("renderer")();

  $: scale =
    Math.sqrt(($dimensions.width * $dimensions.height) / $umapData.length) /
    400;

  $: umapProjection = $umapData.map((d, i) => ({
    id: d.id,
    x: $scales.x(d.x),
    y: $scales.y(d.y),
    scale,
    alpha: 1,
    zIndex: 0,
    visible: true,
  }));

  $: lastProjection = umapProjection;

  let lastSelected;
  const distanceCutoff = 5;

  $: quadtree = d3quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll(umapProjection);

  const selection = select(outerContainer).on("pointermove", mousemove);

  // $: console.log($sprites);

  $: render(umapProjection, renderer, container);

  function mousemove(e) {
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

      if (lastSelected) {
        const distance = $distanceTensors.find((d) => d.id === lastSelected.id);

        const newProjection = umapProjection.map((d) => {
          const alpha = distance.distances.find((e) => e[0] == d.id) ? 1 : 0.2;
          const active = lastSelected ? lastSelected.id === d.id : false;
          return { ...d, scale: active ? scale * 1.2 : d.scale, alpha };
        });
        lastProjection = newProjection;
      } else {
        lastProjection = umapProjection;
      }

      render(lastProjection);
    }
  }

  function render(projection) {
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
</script>

<slot />
