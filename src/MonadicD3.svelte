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
    import {
        interpolate as d3interpolate,
        interpolateNumber,
    } from "d3-interpolate";

    import { select, selectAll } from "d3-selection";
    import { style } from "d3-selection";

    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    export let id;
    export let search;

    let current = id;
    let large = false;
    let animating = false;
    let container;
    let selection;

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

    async function link(id) {
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
        const r = Math.min(width, height) / 5;
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
                scale = 6;
                style += `transform: translate(${parseInt(x)}px, ${parseInt(
                    y
                )}px) scale(${scale.toPrecision(3)})`;
            } else {
                const score = 1 - (maxScore - d.score) / (maxScore - minScore);
                const alpha = score * Math.PI * 1.8;
                const rand = (1 + Math.random()) * 100;
                // console.log(score);
                x = Math.cos(alpha) * (r + rand) + width / 2;
                y = Math.sin(alpha) * (r + rand) + height / 2;
                scale = 0.5 + score * 2;
                style += `transform: translate(${parseInt(x)}px, ${parseInt(
                    y
                )}px) scale(${scale.toPrecision(3)})`;
            }
            return { ...d, style, x, y, scale };
        });

        console.log(selection, items);

        if (container) {
            let s = select(container)
                .selectAll("div")
                .data(items, (d) => d.id);

            s.exit().remove();

            s.enter()
                .append("div")
                .classed("item", true)
                .on("click", (e, d) => {
                    link(d.id);
                })
                .style(
                    "transform",
                    (d) =>
                        `translate(${parseInt(d.x)}px, ${parseInt(
                            d.y
                        )}px) scale(${d.scale},${d.scale})`
                )
                .append("img")
                .attr("src", (d) => `${baseUrl}${d.id}.jpg`);

            //classed("current", (d) => d.id == id)
            s.transition()
                .duration(1)
                .delay((d, i) => i * 30)
                .style(
                    "transform",
                    (d) =>
                        `translate(${parseInt(d.x)}px, ${parseInt(
                            d.y
                        )}px) scale(${d.scale},${d.scale})`
                );
        }
    }

    onMount(() => {
        selection = select(container); //.selectAll("div").data(items).
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

    .container :global(.item) {
        position: absolute;
        width: 50px;
        height: 50px;
        cursor: pointer;
        transform-origin: center;
        transition: transform 1s;
        will-change: transform;
    }

    .container :global(img) {
        width: 50px;
        /* height: 100%; */
        position: absolute;
        /* transform: translate(-50%, -50%); */
        /* transition: transform 1s; */
        /* left: -50%;
        top: -50%; */
    }
    .container :global(.current img) {
        transform: initial;
    }
</style>

<div class="container" bind:this={container} />
