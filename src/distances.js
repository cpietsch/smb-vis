import { writable, derived, readable } from 'svelte/store';
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import { json } from "d3-fetch";

// import { tensor1d } from "@tensorflow/tfjs";
// export const distanceTensors = readable([], set => {
//     csv("data/pca-titel-bild-embeds.csv", row => ({
//         id: row.id,
//         tensor: tf.tensor1d(new Float32Array(Array(512).fill(0).map((_, i) => row[i] / 10000)))
//     })).then(set)
// });


export const distanceTensors = readable([], set => {
    json("data/pca-titel-bild-embeds.json").then(set)
});