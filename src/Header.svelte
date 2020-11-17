<script>
  import Search from "./Search.svelte";
  import Home from "./Home.svelte";
  import { route, darkmode } from "./stores";
</script>

<style>
  .header {
    height: 80px;
    width: 100%;
    position: fixed;
    top: 0;
    z-index: 200;
    pointer-events: none;
    transition: background 0.5s;
  }

  .dark.shadow {
    background: #3a3a3aeb;
  }

  .shadow {
    /* background: linear-gradient(#eee, rgba(238, 238, 238, 0)); */
    background: rgba(255, 255, 255, 0.91);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
</style>

<div
  class="header"
  class:dark={$darkmode}
  class:shadow={$route.view === 'list'}>
  <Home />
  <Search />
</div>
