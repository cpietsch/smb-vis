<script>
  import { onMount } from "svelte";

  import Renderer from "./Renderer.svelte";
  import TextureLoader from "./TextureLoader.svelte";
  // import Stage from "./Stage.svelte";
  // import Layout from "./Layout.svelte";
  import Details from "./Details.svelte";
  import Home from "./Home.svelte";
  import Dataloader from "./Dataloader.svelte";
  import Cloud from "./Cloud.svelte";
  import List from "./ListSimple.svelte";
  import Debug from "./Debug.svelte";
  import Annotations from "./Annotations.svelte";
  import Monadic from "./Monadic.svelte";

  import { state } from "./stores";

  let route = {
    view: "cloud",
    payload: undefined,
    extra: undefined,
  };

  async function hashchange() {
    const r = window.location.hash.substring(2).split("/");
    console.log(r);
    route.view = r[0];
    route.payload = r[1] ? r[1] : route.payload;
    route.extra = r[2] ? r[2] : route.extra;
    console.log(route);
  }

  onMount(hashchange);
</script>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
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

  :global(*, *:before, *:after) {
    box-sizing: border-box;
  }

  main {
    height: 100%;
    font-family: "Roboto", sans-serif;
  }
</style>

<svelte:window on:hashchange={hashchange} />

<main>
  <Home />
  <Dataloader>
    <!-- {#if route.view === 'cloud' || route.view === undefined} -->
    <Renderer>
        <!-- <TextureLoader /> -->
        <!-- <Cloud {route} /> -->
        <!-- <Annotations /> -->
      </Renderer>
    <!-- {/if} -->
    {#if route.view === 'list'}
      <List id={route.payload} search={route.extra} />
    {/if}
    {#if route.view === 'monadic'}
      <Monadic id={route.payload} />
    {/if}
  </Dataloader>
  {#if route.view != 'list'}
    <Debug />
  {/if}
  <!-- <Details /> -->
</main>
