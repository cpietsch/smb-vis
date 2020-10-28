import { writable, derived, readable, get } from 'svelte/store';
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { csv, json } from "d3-fetch";
import { Sprite, Texture, Container, Renderer } from "pixi.js";
// import flexsearch from "flexsearch";

console.log("STORE INIT")

export const margin = { top: 20, right: 100, bottom: 20, left: 300 };

export const renderer = writable()

export const searchstring = writable("")

export const container = writable()

export const divContainer = writable()

export const route = writable({
    view: "cloud",
    payload: undefined,
    extra: undefined,
    transition: undefined
})

// export const container = readable(null, set => {
//     const c = new Container()
//     c.sortableChildren = true
//     set(c)

//     return () => c.destroy()
// })

export const umapData = readable([], set => {
    csv("data/umap.csv", ({ id, x, y }) => ({
        id,
        x: +x,
        y: +y,
    })).then(set)
});

export const detailData = readable(new Map(), set => {
    csv("data/export2010.csv").then(data => set(new Map(data.map(d => [d.id, d]))))
});

export const sprites = derived(umapData, $data => {
    console.log("sprites creation")
    const sprites = new Map()
    for (const d of $data) {
        const sprite = new Sprite(Texture.WHITE)
        sprite.scale.x = sprite.scale.y = 0.5
        sprite.anchor.set(0.5);
        sprites.set(d.id, sprite)
    }
    return sprites
})

export const texturesLoaded = writable(false)

export const history = writable([])

export const darkmode = writable(false)

export const state = writable("cloud")

export const lastTransformed = writable({ k: 1, x: 0, y: 0 })

export const mouse = writable([0, 0])

export const anchor = writable()

export const selectedItem = writable(undefined)

export const dimensions = writable({ width: 500, height: 500 });

export const scales = derived(
    [dimensions, umapData],
    ([$dimensions, $umapData]) => {

        const width = $dimensions.width - margin.right - margin.left
        const height = $dimensions.height - margin.bottom - margin.top
        const min = Math.min(width, height)
        const xDiff = (width - min) / 2
        const yDiff = (height - min) / 2

        return {
            x: scaleLinear()
                .nice()
                .range([margin.left + xDiff, min + margin.left + xDiff])
                .domain(extent($umapData, (d) => d.x)),
            y: scaleLinear()
                .nice()
                .range([min - margin.top + yDiff, margin.top + yDiff])
                .domain(extent($umapData, (d) => d.y))
        }
    }
);

export const spriteScale = derived(
    [scales, umapData],
    ([$scales, $umapData]) => {
        const spriteRes = 128
        const range = $scales.x.range()
        const span = range[1] - range[0]
        const scale = span / 30000
        console.log("spriteScale", range, span, scale)
        return scale
    }
);

// export const searchIndex = derived(
//     [detailData],
//     ([$detailData]) => {
//         console.time("create index")
//         const index = new flexsearch("memory");
//         for (let [key, value] of  $detailData) {
//             index.add(key, Object.values(value).join(" "))
//         }
//         console.log(index)
//         console.timeEnd("create index")
//         return index
//     }
// );

// export const searchResults = derived(
//     [searchIndex, searchstring, detailData],
//     ([$searchIndex, $searchstring, $detailData]) => {
//         if($searchstring === ""){
//             return Array.from($detailData.values()).map(d => d.id)
//         } else {
//             console.log($searchstring, $searchIndex)
//             console.time("search")
//             const items = $searchIndex.search($searchstring)
//             console.log(items)
//             console.timeEnd("search")
//             return items
//         }
//     }
// );

export const searchIndex = derived(
    [detailData],
    ([$detailData]) => {
        console.time("create index")
        const index = Array.from($detailData.values())
            .map(d => ([d.id, Object.values(d).join(" ").toLowerCase()]))
        console.timeEnd("create index")
        return index
    }
);

export const searchResults = derived(
    [searchIndex, searchstring],
    ([$searchIndex, $searchstring]) => {
        let items = $searchIndex
        const search = $searchstring.toLowerCase().split(" ")
        if (search !== "") {
            console.time("search")
            search.forEach(s => {
                items = items.filter(d => d[1].indexOf(s) > -1)
            })
            console.timeEnd("search")
        }
        return items.map(d => d[0])
    }
);


export const umapProjection = derived(
    [umapData, spriteScale, scales, searchResults],
    ([$umapData, $spriteScale, $scales, $searchResults]) => ($umapData
        .map(d => ({
            id: d.id,
            x: $scales.x(d.x),
            y: $scales.y(d.y),
            scale: $spriteScale,
            alpha: 1,
            zIndex: 0,
            filters: [],
            visible: $searchResults.includes(d.id),
        })))
);

export const distancesCutoffScore = writable(20)

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
        return []
        // if (!$item || !$distances.size) { return [] }
        // else {
        //     return $distances.get($item.id).distances.filter((d) => d[1] > $score)
        // }
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
