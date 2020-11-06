<script>
  import { umapData, distances, detailData, annotations } from "./stores.js";
</script>

{#if $umapData.length && $distances.size && $detailData.size && $annotations.length}
  <slot />
{/if}
