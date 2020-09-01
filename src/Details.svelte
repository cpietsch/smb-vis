<script>
  import { selectedItem } from "./stores.js";

  //   $: console.log($selectedItem);
</script>

<style>
  .infopanel {
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    margin: 1em;
    background: white;
    padding: 1em;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
  }

  img {
    width: 100%;
    position: relative;
  }
</style>

{#if $selectedItem}
  <div class="infopanel">
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img
      src="https://vikusviewer.fh-potsdam.de/smb/beide/data/1024/{$selectedItem.id}.jpg"
      alt="detail Image" />
  </div>
{/if}
