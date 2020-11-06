<script>
  // made by christopher pietsch chrispie.com 2020
  import { onMount, onDestroy } from "svelte";
  import { scaleLinear } from "d3-scale";
  import {
    scales,
    container as pixiContainer,
    renderer as pixiRenderer,
    spriteScale,
    lastTransformed,
    annotations,
  } from "./stores.js";

  import { get } from "svelte/store";
  import { Sprite } from "pixi.js";

  // make em small mogrify -geometry 1000x *.png
  const container = get(pixiContainer);
  const renderer = get(pixiRenderer);

  const baseUrl = "annotations/";
  const sprites = [];
  const annotationsMap = new Map();

  let factor = 0.1;
  const visibleScaleCutoff = 6;
  const sizeTable = { 1: 1.7, 2: 1.5, 3: 1.2 };

  const opactiy = scaleLinear()
    .domain([visibleScaleCutoff - 4, visibleScaleCutoff])
    .range([1, 0])
    .clamp(true);

  $: {
    console.log("resize annos");
    factor = $spriteScale * 3;
    for (const sprite of sprites) {
      const annotation = annotationsMap.get(sprite);
      sprite.x = $scales.x(annotation.x);
      sprite.y = $scales.y(annotation.y);
      sprite.scale.x = sprite.scale.y = sizeTable[annotation.size] * factor;
    }
    renderer.render(container);
  }

  $: {
    const visible = $lastTransformed.k < visibleScaleCutoff;
    const opacity = opactiy($lastTransformed.k);
    for (const sprite of sprites) {
      sprite.visible = visible;
      sprite.alpha = opacity;
    }
  }

  function onClick(annotation) {
    console.log("annotation", annotation);
    container.__annotation = annotation.name; // very hacky
  }

  onMount(async () => {
    for (const annotation of $annotations) {
      const sprite = Sprite.from(baseUrl + "big/" + annotation.name + ".png");
      sprite.scale.x = sprite.scale.y = sizeTable[annotation.size] * factor;
      sprite.anchor.set(0.5);
      sprite.x = $scales.x(annotation.x);
      sprite.y = $scales.y(annotation.y);
      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite.on("pointerdown", () => onClick(annotation));
      annotationsMap.set(sprite, annotation);
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
    const container = get(pixiContainer);
    console.log("destroy annos");
    for (const sprite of sprites) {
      container.removeChild(sprite);
      sprite.destroy();
    }
  });
</script>

<slot />
