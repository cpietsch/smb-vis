<script>
  import { lastTransformed, darkmode } from "./stores.js";

  const visibleScaleCutoff = 1.01;

  import { route } from "./stores";

  $: visible =
    $lastTransformed.k < visibleScaleCutoff &&
    $route.view != "list" &&
    $route.view != "monadic";

  function reset() {
    window.location.hash = "#/cloud/reset";
  }
</script>

<style>
  .box {
    overflow-y: hidden;
    direction: rtl;
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    padding: 1em;
    /* pointer-events: none; */
    flex-direction: column;
  }

  .box.visible {
    overflow-y: scroll;
    height: 100vh;
  }
  .inner {
    direction: ltr;
  }
  .dark {
    color: #cecece;
  }

  .blur {
    filter: blur(3px);
    color: #000;
  }

  h1 {
    font-size: 1.5em;
    margin: 0;
    text-transform: uppercase;
    pointer-events: all;
    cursor: pointer;
  }
  h2 {
    font-size: 1em;
    margin-top: 0.4em;
    margin-bottom: 0;
    text-transform: uppercase;
  }

  .intro {
    width: 340px;
    height: 0px;
    overflow: hidden;
    max-width: 100%;
    /* background: #FFF; */
    line-height: 1.4em;
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
    /* display: inline; */
  }
  .intro.visible {
    opacity: 1;
    height: auto;
    pointer-events: visible;
  }

  .home {
    pointer-events: visible;
  }
  .head {
    text-shadow: -2px 0 3px #eeeeeead, 0 2px 3px #eeeeeead, 2px 0 3px #eeeeeead,
      0 -2px 3px #eeeeeead;
  }
  .dark .head {
    text-shadow: -2px 0 3px #000, 0 2px 3px #000, 2px 0 3px #000,
      0 -2px 3px #000;
  }
  /* 
  .head {
    padding: 1em;
    background: linear-gradient(#eee, rgba(238, 238, 238, 0));
  } */
</style>

<div class="home" class:dark={$darkmode}>
  <!-- <div class="box blur">
  <h1>Visuelle Exploration</h1>
  <h2>zweier musealer Sammlungen</h2>
  </div> -->
  <div class="box" class:visible>
    <div class="inner">
      <div class="head">
        <h1 on:click={reset}>Visuelle Exploration</h1>
        <h2>zweier musealer Sammlungen</h2>
      </div>
      <div class="intro" class:visible>
        <p>
          Basierend auf Daten der Staatlichen Museen zu Berlin zeigt die
          Visualisierung über 5000 ausgewählte Objekte aus den Sammlungen der
          Alten Nationalgalerie und dem Museum Europäischer Kulturen. Die
          unterschiedlichen Sammlungsobjekte sind zum Teil sehr unterschiedlich,
          aber sie eint der Entstehungszeitraum des 19. Jahrhunderts.
        </p>
        <p>
          In der Wolke werden die Objekte nach Bild- und Titel-Ähnlichkeit
          algorithmisch angeordnet, so dass ähnliche Objekte nahe beieinander
          und unterschiedliche weiter auseinander liegen. Dadurch gruppieren
          sich besonders ähnliche Objekte. Um etwas Orientierung zu bieten,
          haben Kuratorinnen der Sammlungen einige hervorstechende Gruppierungen
          beispielhaft mit Stichwörtern versehen.
        </p>
        <p>
          Zoomen Sie mit dem Touchpad oder Scrollrad in die Wolke hinein oder
          klicken Sie auf ein Stichwort oder Bild, um näher an die Objekte
          heranzukommen. Klicken und ziehen Sie den Hintergrund, um den
          Sichtbereich zu verschieben. Klicken Sie auf ein Objekt, um dessen
          Titel sowie besonders ähnliche Objekte durch Hervorhebung angezeigt zu
          bekommen. Klicken Sie auf den Titel des Objekts, um in die Pfadansicht
          zu gelangen.
        </p>
        <p>
          In der Pfadansicht werden jene Objekte in einer Liste angezeigt, die
          einem ausgewählten Objekt ähneln oder einer Suchanfrage entsprechen.
          Die Ausschläge zwischen den Objekten zeigen den Grad der Ähnlichkeit:
          Je größer der Ausschlag, desto weiter entfernt und somit unähnlicher
          werden die Objekte zum Start-Objekt im Vergleich zum vorherigen
          Objekt.
        </p>
        <p>
          Die Visualisierung entstand in einer Forschungskooperation zwischen
          den Staatlichen Museen zu Berlin und dem UCLAB der Fachhochschule
          Potsdam im Rahmen des Projektes Museum4punkt0 mit Unterstützung des
          Museums Europäischer Kulturen und der Alten Nationalgalerie
          Sammlungen. Die Zielstellung des Projektes war es, das Potenzial
          assoziativer Visualisierung sammlungsübergreifender Daten zu
          untersuchen. Weitere Informationen und den Quellcode finden sich in
          der Projektdokumentation auf GitHub.
        </p>

        <ul>
          Team FHP:
          <li>
            Christopher Pietsch: Konzept, Datenanalyse & Prototypentwicklung,
            Design
          </li>
          <li>Viktoria Brüggemann: Projektkoordination und Methodik</li>
          <li>Mark-Jan Bludau: Konzeptentwicklung und Screendesign</li>
          <li>Marian Dörk: Wissenschaftliche Leitung</li>
        </ul>

        <ul>
          Team SMB:
          <li>Stephanie Thom</li>
          <li>Timo Schuhmacher</li>
          <li>Katharina Fendius</li>
          <li>Marian Dörk: Wissenschaftliche Leitung</li>
        </ul>

        <p>Datenschutz & Impressum</p>
      </div>
    </div>
  </div>
</div>
