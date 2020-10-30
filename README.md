# Visuelle Exploration zweier musealer Sammlungen
URL: https://cpietsch.github.io/smb-vis/

**Work in progress...**

### Description
Visual exploration of two museum collections is an exploratory visualization of collections with data from the Staatliche Museen zu Berlin. The visualization currently contains 5,140 objects from the collections of the Alte Nationalgalerie and the Museum of European Cultures and from the 19th century. The visualization shows the collection objects arranged according to image and title similarity (i.e. objects with similar images and titles are visually close together) and enables the exploration of individual similarity paths when selecting objects or searching for keywords.

### Funding
This prototype is part of the project museum4punkt0 - Digital Strategies for the Museum of the Future, sub-project Rethinking Visitor Journeys. Further information: www.museum4punkt0.de/en/.

The project museum4punkt0 is funded by the Federal Government Commissioner for Culture and the Media in accordance with a resolution issued by the German Bundestag (Parliament of the Federal Republic of Germany).

### Installation
Nodejs is required to execute the following commands.
```
npm i
npm run dev
npm run build
```

### Usage
The public folder will be copied to a web server after running `npm run build`. Alternatively, GitHub can also be used to host the visualization. The gh-pages branch is used for this via `npm run deploy`.

### Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

### Credits
- Christopher Pietsch
- Mark Jan Bludau
- Viktoria Brueggemann
- Marian Dörk

### License
MIT License

Copyright (c) Christopher Pietsch and contributors

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

