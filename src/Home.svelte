<script>
  export let action;
  export let id;
  import { activeRoute } from "./pager/Router.svelte";
  console.log("init home");

  $: {
    console.log(id, action);
  }
</script>

<h1>SMB goes wild {action}{id}</h1>
<p>{JSON.stringify($activeRoute)}</p>
