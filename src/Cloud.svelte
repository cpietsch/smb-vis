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
    route,
    anchor,
    searchstring,
    renderer as pixiRenderer,
    container as pixiContainer,
    divContainer,
  } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { interpolate as d3interpolate } from "d3-interpolate";
  import { get } from "svelte/store";
  import { zoom as d3zoom, zoomTransform, zoomIdentity } from "d3-zoom";
  import { extent } from "d3-array";
  import { filters } from "pixi.js";
  import { xml } from "d3-fetch";

  // const { renderer, container, outerContainer } = getContext("renderer")();
  const maxZoomLevel = 45;
  const distanceCutoff = 5;

  let clusterZoomLevel = 8;
  let clearZoomLevel = 1.05;
  let lastTransform = zoomIdentity;
  let stale = false;
  let lastSelected;

  console.log("init cloud");

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

  const blur = new filters.BlurFilter();

  const renderer = get(pixiRenderer);
  const container = get(pixiContainer);
  const outer = get(divContainer);

  let lastProjection = $umapProjection;

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

  // resize handler
  $: {
    const { width, height } = $dimensions;
    console.log("resize cloude");
    selection.call(
      zoom.translateExtent([
        [0, 0],
        [$dimensions.width, $dimensions.height],
      ])
    );
    // renderProjection(lastProjection);
  }

  searchstring.subscribe((s) => {
    if (s !== "" && lastTransform.k !== 1) {
      console.log("reset search");
      resetZoom().catch((e) => {}); //nasty catch
    }
  });

  $: renderProjection($umapProjection);

  const selection = select(outer)
    .call(zoom)
    .on("click", click)
    .on("pointermove", mousemove)
    .on("contextmenu", contextmenu);

  // console.log($dimensions);
  // test("HALLLOO");

  $: quadtree = d3quadtree()
    .x((d) => d.x)
    .y((d) => d.y)
    .addAll($umapProjection);

  function animateToList() {}

  let lastRoute = { ...$route };
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

      resetZoom();
    } else if ($route.view === "cloud" && id) {
      // console.log(selection, "DOIT");

      zoomToId(id)
        .then(() => (stale = false))
        .then(() => {
          highlight({ id });
          // lastSelected = { id };
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
    }
    if ($route.transition == "cloud" && $route.payload == "suche") {
      stale = true;
      route.set({ ...$route, transition: "cloud-list" });
    }

    lastRoute = { ...$route };
  }

  $: highlight($selectedItem);

  function highlight(item) {
    if (item) {
      // && lastTransform.k >= clearZoomLevel
      // if (item) {
      //await tick();
      const distancesFiltered = $getSelectedDistances(item.id);
      const newProjection = $umapProjection.map((d) => {
        const inDistance = distancesFiltered.find((e) => e[0] == d.id);
        const alpha = inDistance ? 1 : 0.1;
        const filters = distancesFiltered.find((e) => e[0] == d.id)
          ? []
          : [blur];
        const active = item ? item.id === d.id : false;
        return {
          ...d,
          scale: active ? $spriteScale * 1.2 : d.scale,
          zIndex: inDistance ? (active ? 2 : 1) : 0,
          alpha,
          // filters
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

    // if (lastSelected !== selected) {
    //   lastSelected = selected;
    //   highlight(lastSelected)
    // }
  }

  function click(e) {
    console.log("click", lastTransform.k);
    if (stale) return;
    const m = pointer(e);
    const p = lastTransform.invert(m);
    let selected = quadtree.find(p[0], p[1]);
    if (!selected) return;
    const distance = Math.hypot(p[0] - selected.x, p[1] - selected.y);

    if (distance > distanceCutoff) {
      selected = null;
    }

    if ($selectedItem !== selected) {
      // lastSelected = selected;
      selectedItem.set(selected);
    }

    if (selected) {
      // zoomToExtend(
      //   [selected],
      //   Math.max(lastTransform.k, clusterZoomLevel),
      //   500
      // ).then(() => {
      //   stale = false;
      // });
      window.location.hash = "#/cloud/" + selected.id;
    }

    // highlight(lastSelected);
  }

  // function clickOld() {
  //   console.log("lastTransform", lastTransform.k);
  //   if (stale) return;
  //   if (lastSelected === null) {
  //     return resetZoom();
  //   }
  //   if (lastTransform.k >= clusterZoomLevel) {
  //     console.log(history);
  //     history.update((h) => [...h, lastSelected.id]);
  //     return zoomToSimilars()
  //       .then(fadeOutOthers)
  //       .then((d) => {
  //         // console.log(d);
  //         // stale = false;
  //         // state.set("list");
  //         window.location.hash = "/list/" + lastSelected.id;
  //       });
  //   }

  //   if (lastTransform.k !== clusterZoomLevel) {
  //     return zoomToExtend([lastSelected], clusterZoomLevel).then(() => {
  //       stale = false;
  //       console.log(lastTransform);
  //     });
  //     //return zoomToPos($selectedItem.x, $selectedItem.y, zoomTo);
  //   }
  // }

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
      // s.filters = d.filters
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

  function zoomToId(id) {
    const item = $umapProjection.find((d) => d.id == id);

    return zoomToExtend([item]);
  }

  function zoomToExtend(items, minZoom = maxZoomLevel, duration = 1500) {
    stale = true;
    const { width, height } = $dimensions;
    const [x0, x1] = extent(items, (d) => d.x);
    const [y0, y1] = extent(items, (d) => d.y);
    console.log(x0, x1, y0, y1);
    console.log(items);

    return selection
      .transition()
      .duration(duration)
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

  function zoomed(e) {
    // console.log(e);
    lastTransform = e.transform;
    container.scale.set(lastTransform.k);
    container.position.x = lastTransform.x;
    container.position.y = lastTransform.y;
    lastTransformed.set({ ...lastTransform });

    if ($selectedItem && lastTransform.k < clearZoomLevel && e.sourceEvent) {
      selectedItem.set(null);
      // lastSelected = null;
      // highlight(lastSelected);
    }
    // if(e.sourceEvent) {
    //   mousemove(e)
    // } else {
    //   renderer.render(container);
    // }
    renderer.render(container);
  }

  function end({ transform }) {
    // asd
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
