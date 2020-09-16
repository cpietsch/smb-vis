<script>
  export let username;
  import { activeRoute } from "./pager/Router.svelte";
</script>

<h1>SMB goes wild {username}</h1>
<p>{JSON.stringify($activeRoute)}</p>
