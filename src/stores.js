import { writable, derived, readable, get } from 'svelte/store';
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { csv, json } from "d3-fetch";
import { Sprite, Texture } from "pixi.js";

console.log("STORE INIT")

export const margin = { top: 20, right: 20, bottom: 20, left: 20 };

export const umapData = readable([], set => {
    csv("data/umap.csv", ({ id, x, y }) => ({
        id,
        x: +x,
        y: +y,
    })).then(set)
});
export const detailData = readable(new Map(), set => {
    csv("data/export1305-bitlabels.csv").then(data => set(new Map(data.map(d => [d.id, d]))))
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

export const lastTransformed = writable({ k: 1, x: 0, y: 0 })

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

export const spriteScale = derived(
    [dimensions, umapData],
    ([$dimensions, $umapData]) => (Math.sqrt(($dimensions.width * $dimensions.height) / $umapData.length) /
        400)
);

export const umapProjection = derived(
    [umapData, spriteScale, scales],
    ([$umapData, $spriteScale, $scales]) => ($umapData
        .map(d => ({
            id: d.id,
            x: $scales.x(d.x),
            y: $scales.y(d.y),
            scale: $spriteScale,
            alpha: 1,
            zIndex: 0,
            visible: true,
        })))
);

export const distancesCutoffScore = writable(30)
export const distances = readable(new Map(), set => {
    json("data/pca-titel-bild-embeds.json")
        .then(data =>
            set(new Map(data.map(d => [d.id, d])))
        )
});
export const selectedDistances = derived(
    [selectedItem, distances, distancesCutoffScore],
    ([$item, $distances, $score]) => {
        // console.log($item, $distances, $score)
        if (!$item || !$distances.size) { return [] }
        else {
            return $distances.get($item.id).distances.filter((d) => d[1] > $score)
        }
    })

export const getSelectedDistances = derived(
    [distances, distancesCutoffScore],
    ([$distances, $score]) => {
        return (id) => {
            if (!$distances.size) { return [] }
            else {
                return $distances.get(id).distances.filter((d) => d[1] > $score)
            }
        }
    })
