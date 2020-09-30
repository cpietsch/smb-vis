<script>
  import { onDestroy, getContext } from "svelte";
  import { umapData, distances, detailData } from "./stores.js";
</script>

{#if $umapData.length && $distances.size && $detailData.size}
  <slot />
{/if}
