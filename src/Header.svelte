<script>
  import Search from "./Search.svelte";
  import Home from "./Home.svelte";

  export let route;
</script>

<style>
  .header {
    background: linear-gradient(#eee, rgba(238, 238, 238, 0));
    height: 120px;
    width: 100%;
    position: absolute;
    top: 0;
    z-index: 200;
    pointer-events: none;
    user-select: none;
  }
</style>

<div class="header">
  <Home {route} />
  <Search />
</div>
