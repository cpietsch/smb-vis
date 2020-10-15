<script>
    import Search from "./Search.svelte";
    import Home from "./Home.svelte";

    export let route;
</script>

<style>
</style>

<div class="header">
    <Home {route} />
    <Search />
</div>
