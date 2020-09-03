import { writable, derived, readable } from 'svelte/store';
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { csv, json } from "d3-fetch";
import { Sprite, Texture } from "pixi.js";


export const margin = { top: 20, right: 20, bottom: 20, left: 20 };

export const umapData = readable([], set => {
    csv("data/umap.csv", ({ id, x, y }) => ({
        id,
        x: +x,
        y: +y,
    })).then(set)
});

export const sprites = derived(umapData, $data => {
    const sprites = new Map()
    for (const d of $data) {
        const sprite = new Sprite(Texture.WHITE)
        sprite.scale.x = sprite.scale.y = 0.5
        sprite.anchor.set(0.5);
        sprites.set(d.id, sprite)
    }
    return sprites
})

export const state = writable("cloud")

export const transfrom = writable({ k: 1, x: 0, y: 0 })

export const mouse = writable([0, 0])

export const selectedItem = writable(undefined)

export const dimensions = writable({ width: 70, height: 70 });

export const scales = derived(
    [dimensions, umapData],
    ([$dimensions, $umapData]) => ({
        x: scaleLinear()
            .nice()
            .range([margin.left, $dimensions.width - margin.right])
            .domain(extent($umapData, (d) => d.x)),
        y: scaleLinear()
            .nice()
            .range([$dimensions.height - margin.bottom, margin.top])
            .domain(extent($umapData, (d) => d.y))
    })
);

export const distances = readable(new Map(), set => {
    json("data/pca-titel-bild-embeds.json")
        .then(data =>
            set(new Map(data.map(d => [d.id, d])))
        )
});

// export const selectedDistances = derived([selectedItem, distances], ([$item, $distances]) => {
//     return $distances.get($item.id)
// })
