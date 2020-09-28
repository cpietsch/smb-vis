<script>
  import { onMount, getContext, onDestroy, tick } from "svelte";
  import { scaleLinear, scaleLog } from "d3-scale";
  import { quadtree as d3quadtree } from "d3-quadtree";
  import { scales, lastTransformed } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { interpolate as d3interpolate } from "d3-interpolate";
  import { get } from "svelte/store";
  import { zoom as d3zoom, zoomTransform, zoomIdentity } from "d3-zoom";
  import { extent } from "d3-array";
  import { xml } from "d3-fetch";
  import { csv, json } from "d3-fetch";
  import { Sprite, Texture } from "pixi.js";

  const { renderer, container, outerContainer } = getContext("renderer")();

  const baseUrl = "annotations/";
  const sprites = [];
  let subsription;
  const size = scaleLog().range([0.12, 0.02]).domain([1, 20]).clamp(true);

  onMount(async () => {
    const { annotations } = await json(baseUrl + "annotations.json");
    for (const annotation of annotations) {
      //   console.log(annotation);

      const sprite = Sprite.from(baseUrl + annotation.name + ".png");
      sprite.scale.x = sprite.scale.y =
        ((3 - annotation.size) / 2) * 0.04 + size(1);
      sprite.anchor.set(0.5);
      sprite.x = $scales.x(annotation.x);
      sprite.y = $scales.y(annotation.y);
      sprite.__asize = annotation.size;
      sprites.push(sprite);
      container.addChild(sprite);
    }

    subsription = lastTransformed.subscribe((t) => {
      //   console.log(t.k, size(t.k));
      for (const sprite of sprites) {
        sprite.scale.x = sprite.scale.y =
          ((3 - sprite.__asize) / 2) * 0.04 + size(t.k);
      }
    });
    // console.log(annotations);
  });

  onDestroy(() => {
    console.log("detstasdroyasd annos");
    for (const sprite of sprites) {
      container.removeChild(sprite);
      sprite.destroy();
    }
    subsription();
  });
</script>

<slot />
