<script>
  import Renderer from "./Renderer.svelte";
  import TextureLoader from "./TextureLoader.svelte";
  // import Stage from "./Stage.svelte";
  // import Layout from "./Layout.svelte";
  import Details from "./Details.svelte";
  import Dataloader from "./Dataloader.svelte";
  import Cloud from "./Cloud.svelte";
  import List from "./List.svelte";
  import { state } from "./stores";
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

<main>
  <Dataloader>
    <Renderer>
      {#if $state === 'list'}
        <List />
      {/if}
      <!-- <Cloud>
        <TextureLoader />
      </Cloud> -->
      <!-- <Stage /> -->
      <TextureLoader />
      <!-- <Layout /> -->
      <Cloud />
    </Renderer>
  </Dataloader>

  <!-- <Details /> -->
</main>
