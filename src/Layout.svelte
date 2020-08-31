<script>
  import { onMount, getContext, setContext } from "svelte";
  //   import { csv } from "d3-fetch";
  import { extent, scaleLinear, csv } from "d3";

  const { height, renderer, container } = getContext("renderer")();
  let width = getContext("width")();
  const sprites = getContext("sprites")();
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  $: {
    console.log(width);
  }

  const render = (projection, sprites, renderer, container) => {
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

  (async () => {
    const umap = await csv("data/umap.csv", ({ id, x, y }) => ({
      id,
      x: +x,
      y: +y,
    }));

    const x = scaleLinear()
      .domain(extent(umap, (d) => d.x))
      .nice()
      .range([margin.left, width - margin.right]);

    const y = scaleLinear()
      .domain(extent(umap, (d) => d.y))
      .nice()
      .range([height - margin.bottom, margin.top]);

    const scale = Math.sqrt((width * height) / umap.length) / 400;

    const umapProjection = umap.map((d, i) => ({
      id: d.id,
      x: x(d.x),
      y: y(d.y),
      scale,
      alpha: 1,
      zIndex: 0,
      visible: true,
    }));

    render(umapProjection, sprites, renderer, container);
  })();
</script>

<slot />
