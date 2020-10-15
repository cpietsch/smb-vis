<script>
    import { onMount } from "svelte";
    import {
        distancesCutoffScore,
        selectedItem,
        darkmode,
        history,
        anchor,
        searchstring,
        // searchItems,
        lastTransformed,
        searchResults,
    } from "./stores.js";
    import { get } from "svelte/store";
    import { flip } from "svelte/animate";

    // $: console.log($fuseSearch)

    function handleSubmit() {
        console.log($searchstring);
        window.scrollTo({ top: 0 });
        window.location.hash = "#/list/suche/" + $searchstring;
    }

    onMount(() => {
        return () => {};
    });
</script>

<style>
    .debug {
        position: absolute;
        right: 0;
        top: 0;
        width: 300px;
        padding: 1em;
        /* margin: 1em;
        background: white;
        padding: 1em;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        border-radius: 6px; */
        display: flex;
        flex-flow: column;
        z-index: 100;
        overflow: hidden;
    }

    .item {
        display: flex;
        justify-content: space-between;
        flex-flow: column;
        width: 100%;
    }

    #search {
        width: 100%;
        border: none;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        background: #fff;
        padding: 1em;
    }
</style>

<div class="debug">
    <div class="item">
        <div>
            <form on:submit|preventDefault={handleSubmit}>
                <!-- <label for="search">Suche ({$searchResults.length})</label> -->
                <input type="search" id="search" placeholder="Suche" bind:value={$searchstring} />
            </form>
        </div>
    </div>
</div>
