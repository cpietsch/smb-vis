<script>
  import { onMount, setContext } from "svelte";
  import { Container } from "pixi.js";

  export let sprites;

  console.log("Container", sprites);

  onMount(() => {
    console.log(sprites);
    return () => {};
  });
</script>

<slot />
