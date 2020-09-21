<script>
  import { onMount } from "svelte";

  import Renderer from "./Renderer.svelte";
  import TextureLoader from "./TextureLoader.svelte";
  // import Stage from "./Stage.svelte";
  // import Layout from "./Layout.svelte";
  import Details from "./Details.svelte";
  import Dataloader from "./Dataloader.svelte";
  import Cloud from "./Cloud.svelte";
  import List from "./ListSimple.svelte";
  import Debug from "./Debug.svelte";

  import { state } from "./stores";

  let route = {
    view: "cloud",
    payload: undefined,
    extra: undefined,
  };

  async function hashchange() {
    const r = window.location.hash.substring(2).split("/");
    route.view = r[0] ? r[0] : route.view;
    route.payload = r[1] ? r[1] : route.payload;
    route.extra = r[2] ? r[2] : route.extra;
    console.log(route);
  }

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

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  main {
    height: 100%;
    font-family: Helvetica, sans-serif;
  }
</style>

<svelte:window on:hashchange={hashchange} />

<main>
  <Dataloader>
    <!-- <Renderer>
      <TextureLoader />
      <Cloud {query} />
    </Renderer> -->
    {#if route.view === 'list'}
      <List id={route.payload} />
    {/if}
  </Dataloader>
  <Debug />
  <!-- <Details /> -->
</main>
