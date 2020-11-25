# Visuelle Exploration zweier musealer Sammlungen

### Description
Visual exploration of two museum collections is an exploratory visualization of collections with data from the Staatliche Museen zu Berlin. The visualization currently contains 5,140 objects from the collections of the Alte Nationalgalerie and the Museum of European Cultures and from the 19th century. The visualization shows the collection objects arranged according to image and title similarity (i.e. objects with similar images and titles are visually close together) and enables the exploration of individual similarity paths when selecting objects or searching for keywords.

### Funding
This prototype is part of the project museum4punkt0 - Digital Strategies for the Museum of the Future, sub-project Rethinking Visitor Journeys. Further information: www.museum4punkt0.de/en/.

The project museum4punkt0 is funded by the Federal Government Commissioner for Culture and the Media in accordance with a resolution issued by the German Bundestag (Parliament of the Federal Republic of Germany).

### Installation
Nodejs is required to build the visualization. Run the following command in order to install the packages needed for the build and dev environment.
```
npm i
```

### Development
There are 2 build systems included. Running `npm run dev` will start up the default svelte build system including hotreloading. A faster alternative is running svite via `npm run sdev` which will also run a hot reloading environment on port 3000. Svite (vite) is a web dev build tool that serves your code via native ES Module imports during dev.

### Usage
Run `npm run build` and copy the /public folder to a webserver. Alternatively, GitHub can be used to host the visualization. Run `npm run deploy` to build and deploy the visualization to github.io via the gh-pages branch.
We recommend using a webserver with gzip and http2 enabled in order to reduce loading times dramatically.

### Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

### About
Based on data from the National Museums in Berlin, the visualization shows over 5000 selected objects from the holdings of the Alte Nationalgalerie and the Museum of European Cultures. The objects in the collection - from miniature paintings and photographs to everyday objects - come from the 19th century.

In the cloud, the objects are algorithmically arranged according to image content and title information, so that similar objects are close to one another and different ones are further apart. For orientation purposes, the groupings are provided with keywords that were added manually.

Use the touchpad or scroll wheel to zoom into the cloud, or click on a keyword or image to get closer to the objects. Click and drag the background to move the viewing area. Click on an object to highlight its title and particularly similar objects. Click on the title of the object to go to the path view.

In the path view, those objects are displayed in a list that are similar to a selected object or that correspond to a search query. The rashes of the thread between the objects indicate the decreasing similarity: the larger the rash, the further away and thus more dissimilar is the next object to the object selected above.

The visualization was created in a research cooperation between the National Museums in Berlin and the UCLAB of the Potsdam University of Applied Sciences as part of the Museum4punkt0 project with the support of the Museum of European Cultures and the Old National Gallery. The aim of the project was to investigate the potential of associative visualization of cross-collection data.

Further information and the source code can be found in the project documentation on GitHub.

Team FHP
- Christopher Pietsch: Concept, design, data analysis & prototype development
- Viktoria Brüggemann: Project coordination and methodology
- Mark-Jan Bludau: Concept development and screen design
- Marian Dörk: Scientific Director

Museum4punkt0 Teilprojekt M1 SMB
- Stephanie Thom: Museologin, Steuerung Museumsdokumentation
- Timo Schuhmacher: Wissenschaftlicher Mitarbeiter – Bildung & Vermittlung
- Katharina Fendius: Teilprojektsteuerung / Wissenschaftliche Projektreferentin der Stellv. Generaldirektorin der Staatlichen Museen zu Berlin

### License
MIT License

Copyright © 2020 Staatliche Museen zu Berlin / UCLAB FH Potsdam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

