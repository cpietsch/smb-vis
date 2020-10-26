<script>
  import { onMount } from "svelte";

  import Renderer from "./Renderer.svelte";
  import TextureLoader from "./TextureLoader.svelte";
  // import Stage from "./Stage.svelte";
  // import Layout from "./Layout.svelte";
  import Mode from "./Mode.svelte";
  import Header from "./Header.svelte";
  import Dataloader from "./Dataloader.svelte";
  import Cloud from "./Cloud.svelte";
  import List from "./ListSimple.svelte";
  import Debug from "./Debug.svelte";
  import Annotations from "./Annotations.svelte";
  import Monadic from "./MonadicD3.svelte";

  import { route } from "./stores";
  import TitleOverlaySingle from "./TitleOverlaySingle.svelte";

  function hashchange() {
    const r = window.location.hash.substring(2).split("/");
    console.log("set route", r);
    route.set({
      view: r[0],
      payload: r[1],
      extra: r[2],
    });
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
  <Dataloader>
    <Renderer>
      <TextureLoader />
      <Cloud />
      <Annotations />
    </Renderer>
    {#if $route.view === 'list'}
      <List id={$route.payload} />
    {/if}
    {#if $route.view === 'monadic'}
      <Monadic id={$route.payload} />
    {/if}
  </Dataloader>

  {#if $route.view === 'cloud' || $route.view === ''}
    <TitleOverlaySingle />
  {/if}
  {#if $route.view !== 'list'}
    <Header />
  {/if}
  <Mode />
  <!-- <Details /> -->
</main>
