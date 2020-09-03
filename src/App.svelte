<script>
  import Renderer from "./Renderer.svelte";
  import TextureLoader from "./TextureLoader.svelte";
  import Stage from "./Stage.svelte";
  import Layout from "./Layout.svelte";
  import Details from "./Details.svelte";
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
  <Renderer>
    <Stage>
      <TextureLoader />
      <Layout />
    </Stage>
  </Renderer>
  <!-- <Details /> -->
</main>
