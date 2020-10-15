<script>
  import { lastTransformed } from "./stores.js";

  const visibleScaleCutoff = 1.01;

  export let route;

  $: visible = $lastTransformed.k < visibleScaleCutoff && route.view != "list";
</script>

<style>
  .box {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    margin: 1em;

    pointer-events: none;
    /* background: #fff; */
    /* backdrop-filter: blur(2px); */
    padding: 1em;
    flex-direction: column;
  }

  .blur {
    filter: blur(3px);
    color: #000;
  }

  h1 {
    font-size: 1.5em;
    margin: 0;
    text-transform: uppercase;
  }
  h2 {
    font-size: 1em;
    margin-top: 0.4em;
    margin-bottom: 0;
    text-transform: uppercase;
  }

  .intro {
    width: 300px;
    max-width: 100%;
    /* background: #FFF; */
    line-height: 1.4em;
    opacity: 0;
    transition: opacity 0.5s;
    /* display: inline; */
  }

  .visible {
    opacity: 1;
  }
</style>

<div class="home">
  <!-- <div class="box blur">
  <h1>Visuelle Exploration</h1>
  <h2>zweier musealer Sammlungen</h2>
  </div> -->
  <div class="box">
    <h1>Visuelle Exploration</h1>
    <h2>zweier musealer Sammlungen</h2>
    <p class="intro" class:visible>
      … ist eine explorative Sammlungsvisualisierung mit Daten der Staatliche Museen zu Berlin. Aktuell enthält die Visualisierung 5140 Objekte aus den Sammlungen der <b>Alten Nationalgalerie</b> und dem <b>Museum Europäischer Kulturen</b> und dem Entstehungszeitraum des 19. Jahrhunderts. Die Visualisierung zeigt die Sammlungsobjekte angeordnet nach Bild- und Titel-Ähnlichkeit (d.h. Objekte mit ähnlichen Abbildungen und Titeln liegen visuell nahe zusammen) und ermöglicht bei Auswahl von Objekten oder bei Schlagwortsuche die Erkundung individueller Ähnlichkeits-Pfade.
    </p>
  </div>
</div>
