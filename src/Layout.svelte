<script>
  import { onMount, getContext, setContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { quadtree as d3quadtree } from "d3-quadtree";
  import { scales, umapData, dimensions, sprites } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { zoomTransform } from "d3-zoom";

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

  $: quadtree = d3quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll(umapProjection);

  select(outerContainer).on("mousemove", mousemove);

  // $: console.log($sprites);

  $: render(umapProjection, renderer, container);

  function mousemove(e) {
    const m = pointer(e);
    const p = zoomTransform(this).invert(m);
    const selected = quadtree.find(p[0], p[1]);
    const distance = Math.hypot(p[0] - selected.x, p[1] - selected.y);

    if (lastSelected !== selected) {
      lastSelected = selected;
      const newProjection = umapProjection.map((d) => {
        const active = selected ? selected.id === d.id : false;
        return { ...d, scale: active ? scale * 1.2 : d.scale };
      });
      lastProjection = newProjection;
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
