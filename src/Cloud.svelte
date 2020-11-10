<script>
  // made by christopher pietsch chrispie.com 2020
  import { onMount, getContext, setContext, tick } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { quadtree as d3quadtree } from "d3-quadtree";
  import {
    scales,
    dimensions,
    sprites,
    selectedItem,
    hoverItem,
    umapProjection,
    spriteScale,
    lastTransformed,
    getSelectedDistances,
    route,
    anchor,
    renderer as pixiRenderer,
    container as pixiContainer,
    divContainer,
    annotations,
  } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { interpolate as d3interpolate } from "d3-interpolate";
  import { get } from "svelte/store";
  import { zoom as d3zoom, zoomTransform, zoomIdentity } from "d3-zoom";
  import { extent } from "d3-array";
  console.log("init cloud");

  const maxZoomLevel = 45;
  const distanceCutoff = 5;

  let lastTransform = zoomIdentity;
  let stale = false;
  let lastSelected;
  let lastProjection = $umapProjection;
  let lastRoute = { ...$route };

  const renderer = get(pixiRenderer);
  const container = get(pixiContainer);
  const outer = get(divContainer);
  const zoom = d3zoom()
    .scaleExtent([1, maxZoomLevel])
    .translateExtent([
      [0, 0],
      [$dimensions.width, $dimensions.height],
    ])
    .clickDistance(2)
    .filter((e) => !stale)
    .on("zoom", zoomed);
  // .on("end", end);

  const selection = select(outer)
    .call(zoom)
    .on("click", click)
    .on("pointermove", mousemove)
    .on("contextmenu", contextmenu);

  $: {
    const { width, height } = $dimensions;
    console.log("resize cloude");
    selection.call(
      zoom.translateExtent([
        [0, 0],
        [width, height],
      ])
    );
  }

  $: highlight($selectedItem);
  $: renderProjection($umapProjection);
  $: quadtree = d3quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll($umapProjection);

  $: {
    console.log($route, lastRoute);
    const id = $route.payload;

    if ($route.view === "cloud" && lastRoute.view === "list") {
      fadeInAll().then(() => {
        if (id) {
          zoomToId(id).then(() => (stale = false));
        }
      });
    }
    if ($route.view === "cloud" && id === "reset") {
      console.log("reset");
      selectedItem.set(undefined);
      fadeInAll()
        .then(resetZoom)
        .then(() => ((container.__stale = false), (stale = false)));
    } else if ($route.view === "cloud" && id == "cluster") {
      const annotation = $annotations.find((d) => d.name === $route.extra);
      const zoom = { x: $scales.x(annotation.cx), y: $scales.y(annotation.cy) };
      console.log(zoom);
      zoomToExtend([zoom], annotation.czoom).then(
        () => ((container.__stale = false), (stale = false))
      );
    } else if ($route.view === "cloud" && id) {
      zoomToId(id)
        .then(() => (stale = false))
        .then(() => {
          highlight({ id });
          selectedItem.set({ id });
        });
    }
    if ($route.transition == "cloud" && $route.payload != "suche") {
      stale = true;
      zoomToSimilars()
        //.then(fadeOutOthers)
        .then((d) => {
          route.set({ ...$route, transition: "cloud-list" });
        });
    } else if ($route.transition == "cloud" && $route.payload == "suche") {
      stale = true;
      route.set({ ...$route, transition: "cloud-list" });
    }

    lastRoute = { ...$route };
  }

  function highlight(item) {
    if (item) {
      const distancesFiltered = $getSelectedDistances(item.id);
      const newProjection = $umapProjection.map((d) => {
        const inDistance = distancesFiltered.find((e) => e[0] == d.id);
        const alpha = inDistance ? 1 : 0.1;
        const active = item ? item.id === d.id : false;
        return {
          ...d,
          scale: active ? $spriteScale * 1.2 : d.scale,
          zIndex: inDistance ? (active ? 2 : 1) : 0,
          alpha,
        };
      });
      lastProjection = newProjection;
    } else {
      lastProjection = $umapProjection;
    }
    renderProjection(lastProjection);
  }

  function mousemove(e) {
    if (stale) return;
    const m = pointer(e);
    const p = lastTransform.invert(m);
    let selected = quadtree.find(p[0], p[1]);
    if (!selected) return;
    const distance = Math.hypot(p[0] - selected.x, p[1] - selected.y);

    if (distance > distanceCutoff) {
      selected = null;
    }
    selection.style("cursor", selected ? "pointer" : "auto");
    hoverItem.set(selected);
  }

  function click(e) {
    console.log("click", lastTransform.k);
    if (stale) return;

    const m = pointer(e);
    const p = lastTransform.invert(m);
    let selected = quadtree.find(p[0], p[1]);
    if (!selected) return;
    const distance = Math.hypot(p[0] - selected.x, p[1] - selected.y);

    if (lastTransform.k < 3) {
      zoomToId(selected.id, 15).then(() => (stale = false));
      return;
    }

    if (distance > distanceCutoff) {
      selected = null;
    }

    if ($selectedItem !== selected) {
      selectedItem.set(selected);
    }

    if (selected && lastSelected == selected) {
      window.location.hash = "#/list/" + selected.id;
    } else if (selected && lastSelected != selected) {
      window.location.hash = "#/cloud/" + selected.id;
    }

    if (!selected && container.__annotation) {
      window.location.hash = "#/cloud/cluster/" + container.__annotation;
      container.__annotation = false;
    }

    lastSelected = selected;
  }

  function contextmenu(e) {
    const m = pointer(e);
    const p = zoomTransform(this).invert(m);
    console.log(p);
    const x = $scales.x.invert(p[0]);
    const y = $scales.y.invert(p[1]);
    console.log(x, y);
    anchor.set({ x, y });
  }

  function renderProjection(projection) {
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
    return (
      selection
        //.interrupt()
        .transition()
        .duration(1000)
        .call(zoom.transform, zoomIdentity)
        .on("end", () => (stale = false))
        .end()
    );
  }

  function zoomToPos(x, y, scale) {
    console.log("zoomToPos", x, y);
    stale = true;
    return selection
      .transition()
      .duration(1000)
      .call(zoom.scaleTo, scale, lastTransform.apply([x, y]))
      .on("end", () => (stale = false))
      .end();
  }

  function fadeOutOthers() {
    const distances = $getSelectedDistances(lastSelected.id);
    return selection
      .transition()
      .duration(1000)
      .tween("list", function () {
        const newProjection = $umapProjection.map((d) => {
          const alpha =
            distances && distances.find((e) => e[0] == d.id) ? 1 : 0;
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

  function fadeInAll() {
    return selection
      .transition()
      .duration(1000)
      .tween("list", function () {
        const interpolate = d3interpolate(lastProjection, $umapProjection);
        return function (t) {
          lastProjection = interpolate(t);
          renderProjection(lastProjection);
        };
      })
      .end();
  }

  function zoomToSimilars() {
    console.log($selectedItem);
    const { id } = $selectedItem;
    const distances = $getSelectedDistances(id);

    const items = $umapProjection.filter(
      (d) => distances && distances.find((e) => e[0] == d.id)
    );

    return zoomToExtend(items);
  }

  function zoomToId(id, zoomlevel = maxZoomLevel) {
    const item = $umapProjection.find((d) => d.id == id);
    return zoomToExtend([item], zoomlevel);
  }

  function zoomToExtend(items, minZoom = maxZoomLevel) {
    stale = true;
    const { width, height } = $dimensions;
    const [x0, x1] = extent(items, (d) => d.x);
    const [y0, y1] = extent(items, (d) => d.y);

    const transform = zoomIdentity
      .translate(width / 2, height / 2)
      .scale(
        Math.min(minZoom, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
      )
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);

    const a = transform.x / transform.k - lastTransform.x / lastTransform.k;
    const b = transform.y / transform.k - lastTransform.y / lastTransform.k;
    const distance = Math.sqrt(a * a + b * b);
    const duration = Math.log(distance) * 400;

    return selection
      .transition()
      .duration(duration)
      .call(
        zoom.transform,
        transform
        //[x, y] // do i need the anchor ?
      )
      .end();
  }

  function zoomed(e) {
    lastTransform = e.transform;
    container.scale.set(lastTransform.k);
    container.position.x = lastTransform.x;
    container.position.y = lastTransform.y;
    lastTransformed.set({ ...lastTransform });
    renderer.render(container);
  }

  function end({ transform }) {
    lastTransform = transform;
    lastTransformed.set({ ...transform });
  }
</script>

<slot />
