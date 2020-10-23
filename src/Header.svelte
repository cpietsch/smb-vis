<script>
  import Search from "./Search.svelte";
  import Home from "./Home.svelte";
  import { route, darkmode } from "./stores";
</script>

<style>
  .header {
    height: 120px;
    width: 100%;
    position: absolute;
    top: 0;
    z-index: 200;
    pointer-events: none;
    user-select: none;
  }

  .shadow {
    background: linear-gradient(#eee, rgba(238, 238, 238, 0));
  }
</style>

<div class="header" class:shadow={$route.view === 'list' && !$darkmode}>
  <Home />
  <Search />
</div>
