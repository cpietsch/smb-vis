<script>
  const basePath = "/"; //"/svelte-pagejs";

  import { state } from "./stores";
  import { Router, Route, NotFound, redirect } from "./pager";
  import Home from "./Home.svelte";
  import Vis from "./Vis.svelte";
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
  <Router {basePath}>
    <Route path="/" let:params component={Home} />
    <!-- <Route path="/vis" let:params component={Vis} /> -->
    <Route path="test" let:params component={Home} />
    <Route path="vis/:username?" let:params component={Home} />
    <!-- <Route path="/about" component={About} />
    <Route path="/login" component={Login} />
    <Route path="/profile/:username" let:params /> -->
    <NotFound>
      <h2>Sorry. Page not found.</h2>
    </NotFound>
  </Router>
</main>
