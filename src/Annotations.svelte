<script>
  import { onMount, getContext, onDestroy, tick } from "svelte";
  import { scaleLinear, scaleLog } from "d3-scale";
  import { quadtree as d3quadtree } from "d3-quadtree";
  import { scales, container as pixiContainer, dimensions } from "./stores.js";
  import { select, pointer } from "d3-selection";
  import { interpolate as d3interpolate } from "d3-interpolate";
  import { get } from "svelte/store";
  import { zoom as d3zoom, zoomTransform, zoomIdentity } from "d3-zoom";
  import { extent } from "d3-array";
  import { xml } from "d3-fetch";
  import { csv, json } from "d3-fetch";
  import { Sprite, Texture } from "pixi.js";

  const container = get(pixiContainer)
  
  const baseUrl = "annotations/";
  const sprites = [];
  const imageWidth = 1300;
  let subsription;
  let factor = 0.1;
  const sizeTable = { 1: 1.7, 2: 1.3, 3: 1 };
  const size = scaleLog()
    .range([factor, factor / 5])
    .domain([1, 20])
    .clamp(true);

  $: {
    factor =
      (Math.log($dimensions.width * $dimensions.height) / imageWidth) * 10;
    size.range([factor, factor / 5]);
    console.log(factor);
  }

  onMount(async () => {
    const { annotations } = await json(baseUrl + "annotations.json");
    for (const annotation of annotations) {
      //   console.log(annotation);

      const sprite = Sprite.from(baseUrl + annotation.name + ".png");
      sprite.scale.x = sprite.scale.y = sizeTable[annotation.size] * size(1);
      // sprite.on("added", (s) => {
      //   console.log(s.width);
      // });
      // sprite.scale.x = sprite.scale.y =
      //   ((3 - annotation.size) / 2) * 0.04 + size(1);
      sprite.anchor.set(0.5);
      sprite.x = $scales.x(annotation.x);
      sprite.y = $scales.y(annotation.y);
      sprite.__asize = annotation.size;
      sprites.push(sprite);
      container.addChild(sprite);
    }

    /*
    // this is for dynamic scaling of the labels
    subsription = lastTransformed.subscribe((t) => {
      //   console.log(t.k, size(t.k));
      for (const sprite of sprites) {
        sprite.scale.x = sprite.scale.y = sizeTable[sprite.__asize] * size(t.k);
        // sprite.scale.x = sprite.scale.y =
        //   ((3 - sprite.__asize) / 2) * 0.04 + size(t.k);
      }
    });
    */
  });

  onDestroy(() => {
    console.log("detstasdroyasd annos");
    for (const sprite of sprites) {
      container.removeChild(sprite);
      sprite.destroy();
    }
    // subsription();
  });
</script>

<slot />
