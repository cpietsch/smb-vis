<script>
  import { onMount, getContext, setContext } from "svelte";
  import { csv } from "d3-fetch";
  import { scaleLinear } from "d3-scale";
  import { extent } from "d3-array";
  import { dimensions } from "./stores.js";

  const { renderer, container } = getContext("renderer")();
  const { width, height } = $dimensions;
  const sprites = getContext("sprites")();
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  let umap = [];

  //   const x = scaleLinear().nice();
  //   const y = scaleLinear().nice();

  //   $: {
  //     x.range([margin.left, $dimensions.width - margin.right]);
  //     y.range([$dimensions.height - margin.bottom, margin.top]);
  //   }

  $: x = scaleLinear()
    .nice()
    .range([margin.left, $dimensions.width - margin.right])
    .domain(extent(umap, (d) => d.x));

  $: y = scaleLinear()
    .nice()
    .range([$dimensions.height - margin.bottom, margin.top])
    .domain(extent(umap, (d) => d.y));

  $: scale =
    Math.sqrt(($dimensions.width * $dimensions.height) / umap.length) / 400;

  $: umapProjection = umap.map((d, i) => ({
    id: d.id,
    x: x(d.x),
    y: y(d.y),
    scale,
    alpha: 1,
    zIndex: 0,
    visible: true,
  }));

  $: render(umapProjection, sprites, renderer, container);

  (async () => {
    umap = await csv("data/umap.csv", ({ id, x, y }) => ({
      id,
      x: +x,
      y: +y,
    }));
    // x.domain(extent(umap, (d) => d.x));
    // y.domain(extent(umap, (d) => d.y));
  })();

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
