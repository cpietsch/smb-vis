<script>
  import { onMount, getContext, setContext } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { scales, umapData, dimensions } from "./stores.js";

  const { renderer, container } = getContext("renderer")();
  const sprites = getContext("sprites")();

  //   let umap = [];

  //   $: console.log($umapData);

  //   const x = scaleLinear().nice();
  //   const y = scaleLinear().nice();

  //   $: {
  //     x.range([margin.left, $dimensions.width - margin.right]);
  //     y.range([$dimensions.height - margin.bottom, margin.top]);
  //   }

  //   $: y = scaleLinear()
  //     .nice()
  //     .range([$dimensions.height - margin.bottom, margin.top])
  //     .domain(extent($umapData, (d) => d.y));

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

  $: render(umapProjection, sprites, renderer, container);

  //   (async () => {
  //     umap = await csv("data/umap.csv", ({ id, x, y }) => ({
  //       id,
  //       x: +x,
  //       y: +y,
  //     }));
  //     // x.domain(extent(umap, (d) => d.x));
  //     // y.domain(extent(umap, (d) => d.y));
  //   })();

  const render = (projection, sprites, renderer, container) => {
    console.log("render");
    for (const d of projection) {
      const s = sprites.get(d.id);
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
