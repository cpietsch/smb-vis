<script>
    import { onMount, setContext, tick } from "svelte";
    import {
        dimensions,
        sprites,
        selectedItem,
        getSelectedDistances,
        umapProjection,
        lastTransformed,
        spriteScale,
        detailData,
        searchResults,
        searchstring,
        state,
    } from "./stores.js";
    import { get } from "svelte/store";
    import { select, pointer, selection } from "d3-selection";
    import {
        interpolate as d3interpolate,
        interpolateNumber,
    } from "d3-interpolate";

    import { zoomIdentity } from "d3-zoom";
    import { style } from "d3-selection";

    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    export let id;
    export let search;

    let current = id;
    let large = false;
    let animating = false;
    let container;

    const fields = [
        "_sammlung",
        "_idnr",
        "_actors",
        "_ort",
        "_datum",
        "_material",
        "_abmessung",
        "_stichwort",
    ];

    console.log("hello from list", id);

    const baseUrl = "https://vikusviewer.fh-potsdam.de/smb/beide/data/1024/";

    let items = [];

    async function link(id, internal) {
        window.location.hash = "#/monadic/" + id;
        // setTimeout(() => (animating = false), 1000);
    }
    $: {
        if (id === "suche" && $searchstring !== search) {
            $searchstring = search;
        }
    }

    $: {
        if (id === "suche") {
            console.log($searchResults);
            items = $searchResults
                .map((id, i) => {
                    const data = $detailData.get(id);
                    return { id, score: 1, data, distance: 10, idx: i };
                })
                .filter((a, i) => i < 30);
            console.log(items);
            current = $searchResults[0];
        } else {
            const distances = $getSelectedDistances(id);

            items = distances.map(([id, score], i) => {
                let distance = 10;
                if (i < distances.length - 1) {
                    distance = score - distances[i + 1][1];
                }
                const data = $detailData.get(id);
                return { id, score, data, distance, idx: i };
            });
        }

        const { width, height } = $dimensions;
        const r = Math.min(width, height) / 4;
        const maxScore = items[1].score;
        const minScore = items[items.length - 1].score;
        // const scores = items.map((d) => d.score);
        // const minScore = Math.min(...scores);
        // const maxScore = Math.max(...scores);
        console.log(r, minScore);

        items = items.map((d, i) => {
            let style = ""; //`z-index: ${100 - i}; `;
            let x,
                y,
                scale = 1;
            if (i == 0) {
                x = width / 2;
                y = height / 2;
                scale = 4;
                style += `transform: translate(${parseInt(x)}px, ${parseInt(
                    y
                )}px) scale(${scale.toPrecision(3)});`;
            } else {
                const score = 1 - (maxScore - d.score) / (maxScore - minScore);
                const alpha = score * Math.PI * 1.8;
                // console.log(score);
                x = Math.cos(alpha) * (r + score * 30) + width / 2;
                y = Math.sin(alpha) * (r + score * 30) + height / 2;
                scale = 0.5 + score * 2;
                style += `transform: translate(${parseInt(x)}px, ${parseInt(
                    y
                )}px) scale(${scale.toPrecision(3)});`;
            }
            return { ...d, style, x, y, scale };
        });

        console.log(items);
    }

    function move(node, { duration = 6000, x = 0, y = 0, scale = 1 }) {
        console.log(node);
        return {
            duration,
            css: (t) => {
                // const eased = elasticOut(t);

                return `
					transform: translate(${x}px,${y}px) scale(${scale});
				`;
            },
        };
    }

    onMount(() => {
        return () => {};
    });
</script>

<style>
    .container {
        width: 100%;
        position: absolute;
        background-color: #eeeeee;
        top: 0;
        height: 100%;
        overflow: hidden;
    }

    .item {
        position: absolute;
        width: 50px;
        height: 50px;
        cursor: pointer;
        transform-origin: center;
        transition: transform 1s;
        will-change: transform;
    }

    img {
        width: 50px;
        /* height: 100%; */
        position: absolute;
        /* transform: translate(-50%, -50%); */
        /* left: -50%;
        top: -50%; */
    }
    /* .current img {
        left: 0;
        top: 0;
    } */
</style>

<div class="container" bind:this={container}>
    <div class="liste">
        {#each items as item (item.id)}
            <div
                class="item"
                on:click|preventDefault={() => link(item.id, true)}
                style={item.style}
                transitions:move={{ duration: 5000, x: item.x, y: item.y, scale: item.scale }}>
                {item.id}<img
                    src="{baseUrl}{item.id}.jpg"
                    alt={item.data._titel} />
            </div>
        {/each}
    </div>
</div>
