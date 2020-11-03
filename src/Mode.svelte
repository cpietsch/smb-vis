<script>
  // made by christopher pietsch chrispie.com 2020
  import { darkmode } from "./stores.js";

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    darkmode.set(true);
  }

  // window
  //   .matchMedia("(prefers-color-scheme: dark)")
  //   .addEventListener("change", (e) => {
  //     const newColorScheme = e.matches ? "dark" : "light";
  //     darkmode.set(newColorScheme);
  //   });
</script>

<style>
  .mode {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 300;
    cursor: pointer;
    padding: 5px;
  }
  .icon {
    width: 18px;
    height: 18px;
    background: url("../moon.svg");
  }
  .dark {
    background: url("../sun.svg");
  }
</style>

<div class="mode">
  <div
    class="icon"
    class:dark={$darkmode}
    on:click={() => darkmode.update((d) => !d)} />
</div>
