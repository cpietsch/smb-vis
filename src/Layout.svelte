<script>
  import { onMount, getContext, setContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { scales, umapData, dimensions, sprites } from "./stores.js";

  const { renderer, container } = getContext("renderer")();

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

  $: console.log($sprites);

  $: render(umapProjection, renderer, container);

  const render = (projection, renderer, container) => {
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
  };
</script>

<slot />
