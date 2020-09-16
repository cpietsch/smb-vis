<script>
  import { onDestroy, getContext } from "svelte";
  import { umapData } from "./stores.js";
</script>

{#if $umapData.length}
  <slot />
{/if}
