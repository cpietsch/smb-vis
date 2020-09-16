<script>
  import { onMount } from "svelte";
  import { state } from "./stores";
  import Home from "./Home.svelte";
  import Vis from "./App.svelte";

  let query;

  async function hashchange() {
    var queryParams = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );
    console.log(Object.fromEntries(queryParams.entries()));
    query = Object.fromEntries(queryParams.entries());
  }

  // async function popstate(event) {
  //   console.log("pop", event);
  // }

  onMount(hashchange);
</script>

<style>
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  :global(html, body) {
    height: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  main {
    height: 100%;
  }
</style>

<svelte:window on:hashchange={hashchange} />

<main>
  <Vis />
</main>
