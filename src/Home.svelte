<script>
  import { lastTransformed, darkmode, mobile } from "./stores.js";

  const visibleScaleCutoff = 1.01;

  let closeMobile = false;

  import { route } from "./stores";

  $: visible =
    $lastTransformed.k < visibleScaleCutoff &&
    $route.view != "list" &&
    $route.view != "monadic" &&
    !closeMobile;

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
    padding-left: 2em;
		padding-right: 0;
    flex-direction: column;
  }

  .mobile {
    background: #eee;
    z-index: 1000;
  }
  .dark .mobile {
    background: rgb(43, 43, 43);
  }
  .mobile .intro {
    pointer-events: all;
  }
  .visible.mobile .gradient {
    display: none;
  }

  .box.visible {
    overflow-y: scroll;
    height: 100vh;
    padding-left: 1em;
		padding-right: 0;
  }
  .inner {
    direction: ltr;
  }
  .dark {
    color: #e0e0e0;
  }

  h1 {
    font-size: 1.8em;
    margin: 0;
    text-transform: uppercase;
    pointer-events: all;
    font-weight: 700;
    margin-top: -13px;
  }
  h2 {
    font-size: 1.24em;
    margin-top: -0.3em;
    margin-bottom: 0;
    text-transform: uppercase;
  }

  .intro {
    width: 350px;
    height: 0px;
    overflow: hidden;
    line-height: 1.4em;
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }
  .intro.visible {
    opacity: 1;
    height: auto;
    padding-bottom: 3em;
    pointer-events: visible;
  }
  .intro > p:first-child {
    font-weight: 600;
  }

  .home {
    pointer-events: visible;
  }
  .head {
    cursor: pointer;
    text-shadow: -2px 0 3px #eeeeeead, 0 2px 3px #eeeeeead, 2px 0 3px #eeeeeead,
      0 -2px 3px #eeeeeead;
    user-select: none;
  }
  .dark .head {
    text-shadow: -2px 0 3px #000, 0 2px 3px #000, 2px 0 3px #000,
      0 -2px 3px #000;
  }

  .cloud .head,
  .cloud .dark .head {
    text-shadow: none;
  }

  img {
    width: 90%;
  }

  a {
    color: #000;
    /* font-weight: 600; */
    /* text-decoration: none; */
  }

  .dark a {
    color: #fff;
  }

  .visible .gradient {
    display: block;
  }

  .box:hover .gradient {
    opacity: 0;
  }
  .gradient {
    display: none;
    position: fixed;
    bottom: 0px;
    height: 230px;
    max-width: 100%;
    width: 420px;
    z-index: 400;
    left: 15px;
    transition: opacity 0.5s;
    pointer-events: none;
    background: linear-gradient(0deg, #eeeeee, #eeeeee00 100%);
  }
  .dark .gradient {
    background: linear-gradient(0deg, #232323, #23232300 100%);
  }

  hr {
    margin-bottom: 30px;
    margin-top: 30px;
    border-color: #cccccc;
    width: 50%;
  }

  .closeButton {
    cursor: pointer;
    display: flex;
    background: white;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 50px;
    margin-top: 50px;
    align-items: center;
    flex-direction: column;
    font-weight: 600;
  }
  .closeButton span {
    font-weight: 100;
    opacity: 0.7;
  }
  .dark .closeButton {
    color: #000;
  }

  .dark .arrow {
    border: solid white;
    border-width: 0 3px 3px 0;
  }

  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    padding: 5px;
    margin-right: 4px;
    position: relative;
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
    position: absolute;
    top: 29px;
    left: 14px;
    opacity: 1;
    display: none;
  }
  .cloud .arrow {
    display: inline-block;
  }
</style>

<div class="home" class:dark={$darkmode} class:cloud={$route.view === 'list'}>
  <div class="box" class:visible class:mobile={$mobile}>
    <div class="gradient" />
    <div class="inner">
      <div class="head" on:click={reset}>
        <h1>Visuelle Exploration</h1>
        <h2>zweier musealer Sammlungen</h2>
        <div class="arrow" />
      </div>
      <div class="intro" class:visible>
        <p>
          Basierend auf Daten der Staatlichen Museen zu Berlin zeigt die
          Visualisierung über 5000 ausgewählte Objekte aus dem Bestand der Alten
          Nationalgalerie und dem Museum Europäischer Kulturen. Die
          Sammlungsobjekte—von Miniaturgemälden über Fotografien bis zu
          Alltagsgegenständen—eint der Entstehungszeitraum des 19. Jahrhunderts.
        </p>
        <img src="info/wolke.svg" alt="Wolke-Pictogram" />
        <p>
          In der Wolke werden die Objekte nach Bildinhalten und Titelangaben
          algorithmisch angeordnet, so dass ähnliche Objekte nahe beieinander
          und unterschiedliche weiter auseinander liegen. Zur Orientierung sind
          die Gruppierungen mit Stichwörtern versehen, die händisch hinzugefügt
          wurden.
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
        <img src="info/liste.svg" alt="Listen-Pictogram" />
        <p>
          In der Pfadansicht werden jene Objekte in einer Liste angezeigt, die
          einem ausgewählten Objekt ähneln oder einer Suchanfrage entsprechen.
          Die Ausschläge des Fadens zwischen den Objekten zeigen die abnehmende
          Ähnlichkeit an: Je größer der Ausschlag, desto weiter entfernt und
          somit unähnlicher ist das nächste Objekt zum oben ausgewählten Objekt.
        </p>
        {#if $mobile}
          <div class="closeButton" on:click={() => (closeMobile = true)}>
            Zur Visualisierung
            <span>Optimiert für Tablets und Desktop</span>
          </div>
        {:else}
          <hr noshade="true" />
        {/if}

        <p>
          Die Visualisierung entstand in einer Forschungskooperation zwischen
          den
          <a href="https://www.smb.museum" target="_blank">Staatlichen Museen zu
            Berlin</a>
          und dem
          <a href="https://uclab.fh-potsdam.de/" target="_blank">UCLAB der
            Fachhochschule Potsdam</a>
          im Rahmen des Projektes
          <a
            href="https://www.museum4punkt0.de"
            target="_blank">museum4punkt0</a>
          mit Unterstützung des Museums Europäischer Kulturen und der Alten
          Nationalgalerie. Die Zielstellung des Projektes war es, das Potenzial
          assoziativer Visualisierung sammlungsübergreifender Daten zu
          untersuchen.
        </p>
        <p>
          Weitere Informationen und den Quellcode finden sich in der
          <a
            href="https://github.com/cpietsch/smb-vis"
            target="_blank">Projektdokumentation auf GitHub</a>.
        </p>
        <p>Team FHP</p>
        <ul>
          <li>
            Christopher Pietsch: Konzept, Design, Datenanalyse &
            Prototypentwicklung
          </li>
          <li>Viktoria Brüggemann: Projektkoordination und Methodik</li>
          <li>Mark-Jan Bludau: Konzeptentwicklung und Screendesign</li>
          <li>Marian Dörk: Wissenschaftliche Leitung</li>
        </ul>
        <p>museum4punkt0 Teilprojekt M1 SMB</p>
        <ul>
          <li>Stephanie Thom: Museologin, Steuerung Museumsdokumentation</li>
          <li>
            Timo Schuhmacher: Wissenschaftlicher Mitarbeiter – Bildung &
            Vermittlung
          </li>
          <li>
            Katharina Fendius: Teilprojektsteuerung / Wissenschaftliche
            Projektreferentin der Stellv. Generaldirektorin der Staatlichen
            Museen zu Berlin
          </li>
        </ul>

        <p>
          <a
            href="https://www.preussischer-kulturbesitz.de/service/impressum-rechte.html"
            target="_blank">Datenschutz & Impressum</a>
        </p>
      </div>
    </div>
  </div>
</div>
