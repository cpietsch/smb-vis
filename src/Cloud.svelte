<script>
  import { onMount, getContext, setContext, tick } from "svelte";
  import { scaleLinear } from "d3-scale";
  import { quadtree as d3quadtree } from "d3-quadtree";
  import {
    scales,
    umapData,
    dimensions,
    sprites,
    selectedItem,
    selectedDistances,
    state,
    umapProjection,
    spriteScale,
    lastTransformed,
    getSelectedDistances,
    history,
    anchor,
  } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { interpolate as d3interpolate } from "d3-interpolate";
  import { get } from "svelte/store";
  import { zoom as d3zoom, zoomTransform, zoomIdentity } from "d3-zoom";
  import { extent } from "d3-array";
  import { xml } from "d3-fetch";

  const { renderer, container, outerContainer } = getContext("renderer")();
  const maxZoomLevel = 20;
  const distanceCutoff = 5;

  let clusterZoomLevel = 8;
  let lastTransform = zoomIdentity;
  let stale = false;
  let lastSelected;

  export let route;

  // $: {
  //   console.log("clid", query);
  //   // const { x, y, scale } = query;
  //   const x = parseFloat(query.x);
  //   const y = parseFloat(query.y);
  //   const scale = parseFloat(query.scale);

  //   if (x && y && scale && selection) {
  //     zoomToExtend([{ x, y }], scale);
  //   }
  // }

  const zoom = d3zoom()
    .scaleExtent([1, maxZoomLevel])
    .translateExtent([
      [0, 0],
      [$dimensions.width, $dimensions.height],
    ])
    .clickDistance(2)
    .filter((e) => !stale)
    .on("zoom", zoomed)
    .on("end", end);

  const selection = select(outerContainer)
    .call(zoom)
    .on("click", click)
    .on("pointermove", mousemove)
    .on("contextmenu", contextmenu);

  // console.log($dimensions);
  // test("HALLLOO");

  let lastProjection = $umapProjection;

  let quadtree = d3quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll($umapProjection);

  function animateToList() {}

  let lastRoute = { ...route };
  $: {
    console.log(route, lastRoute);
    if (lastRoute.view === "list" && route.view === "cloud") {
      fadeInAll().then(() => {
        console.log(route.id);
        if (route.payload) {
          zoomToId(route.payload).then(() => (stale = false));
        }
      });
    } else if (route.payload) {
      // console.log(selection, "DOIT");
      zoomToId(route.payload).then(() => (stale = false));
    }
    lastRoute = { ...route };
  }

  // let lastState;
  // state.subscribe((state) => {
  //   console.log("STATE", state, lastState);
  //   if (lastState === "list" && state === "cloud") {
  //     fadeInAll().then(() => (stale = false)); //.then(resetZoom);
  //   }
  //   lastState = state;
  // });

  selectedItem.subscribe(async (selectedItem) => {
    // if( && lastTransform.k > 1)
    if (selectedItem && lastTransform.k > 3) {
      await tick();
      const distancesFiltered = $selectedDistances;
      const newProjection = $umapProjection.map((d) => {
        const alpha = distancesFiltered.find((e) => e[0] == d.id) ? 1 : 0.2;
        const active = selectedItem ? selectedItem.id === d.id : false;
        return {
          ...d,
          scale: active ? $spriteScale * 1.2 : d.scale,
          zIndex: active ? 1 : 0,
          alpha,
        };
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
    // console.log("render");
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
      .on("end", () => (stale = false))
      .end();
  }

  function zoomToPos(x, y, scale) {
    stale = true;
    return selection
      .transition()
      .duration(1000)
      .call(zoom.scaleTo, scale, lastTransform.apply([x, y]))
      .on("end", () => (stale = false))
      .end();
  }

  function fadeOutOthers() {
    const distances = $selectedDistances;
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
    const { x, y, id } = $selectedItem;
    const distances = $selectedDistances;

    const items = $umapProjection.filter(
      (d) => distances && distances.find((e) => e[0] == d.id)
    );

    return zoomToExtend(items);
  }

  function zoomToId(id) {
    const item = $umapProjection.find((d) => d.id == id);

    return zoomToExtend([item]);
  }

  function zoomToExtend(items, minZoom = maxZoomLevel) {
    stale = true;
    const { width, height } = $dimensions;
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
            Math.min(
              minZoom,
              0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)
            )
          )
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
        //[x, y] // do i need the anchor ?
      )
      .end();
  }

  function click() {
    console.log("lastTransform", lastTransform.k);
    if (stale) return;
    if ($selectedItem === null) {
      return resetZoom();
    }
    if (lastTransform.k >= clusterZoomLevel) {
      console.log(history);
      history.update((h) => [...h, $selectedItem.id]);
      return zoomToSimilars()
        .then(fadeOutOthers)
        .then((d) => {
          // console.log(d);
          // stale = false;
          // state.set("list");
          window.location.hash = "/list/" + $selectedItem.id;
        });
    }

    if (lastTransform.k !== clusterZoomLevel) {
      return zoomToExtend([$selectedItem], clusterZoomLevel).then(() => {
        stale = false;
        console.log(lastTransform);
      });
      //return zoomToPos($selectedItem.x, $selectedItem.y, zoomTo);
    }
  }
  function zoomed({ transform }) {
    lastTransform = transform;
    container.scale.set(transform.k);
    container.position.x = transform.x;
    container.position.y = transform.y;
    lastTransformed.set({ ...transform });
    renderer.render(container);
  }

  function end({ transform }) {
    // console.log(transform);

    // const center = transform.invert([
    //   $dimensions.width / 2,
    //   $dimensions.height / 2,
    // ]);
    // var queryParams = new URLSearchParams(
    //   window.location.hash.replace("#", "?")
    // );
    // // queryParams.set("center", center.map((d) => d.toFixed(0)).join("."));
    // queryParams.set("x", center[0].toFixed(2));
    // queryParams.set("y", center[1].toFixed(2));
    // queryParams.set("scale", transform.k.toFixed(2));
    // history.pushState(null, null, "#" + queryParams.toString());
    // // window.location.hash = "#" + queryParams.toString();

    lastTransform = transform;
    lastTransformed.set({ ...transform });
  }
</script>

<slot />
