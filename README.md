![Inkscape-parser banner](/docs/banner.png)

# Inkscape-parser

Inkscape-parser parses the elements of an Inkscape SVG file (shapes, text, paths, etc) into an array of objects.

Comes with full Typescript support.

[Get it on NPM](https://www.npmjs.com/package/inkscape-parser): `npm install inkscape-parser`

Here is an example output:

```js
    // Inkscape SVG elements
    {
        "type": "text",
        "layer": "text",
        "id": "text3769",
        "x": 117.16331,
        "y": 137.12299,
        "value": "circle"
    },
    {
        "type": "path",
        "layer": "paths.subpaths",
        "id": "path4965"
    },
    {
        "type": "rect",
        "layer": "shapes",
        "id": "rect846",
        "label": "rect846-brown",
        "width": 36.977692,
        "height": 23.993158,
        "x": 28.509518,
        "y": 40.647236
    },
    {
        "type": "rect",
        "layer": "shapes",
        "id": "rect1000",
        "label": "rect1000-blue",
        "width": 36.066158,
        "height": 64.996948,
        "x": 43.635647,
        "y": 82.519333
    },
    // [...]
```

## Features

This package is built on top of [svg-parser](https://github.com/Rich-Harris/svg-parser) and handles a few extra things for you:

* The output is a simple array rather than a tree, making it easy to display and convert into CSV or other formats.
* Any multi-line text is merged into a single element from multiple <tspan> tags.
* Additionally, any html entities (&gt; &lt; etc) in text elements are automatically unescaped.
* The inkscape label for each element is included.
* Each element lists all of its parent layers (delimited by a dot: for example "root_layer.sub_layer.sub_sub_layer") according to their inkscape labels.
* Includes a CLI for convenience.

## How to use

You can install it [as an NPM package](https://www.npmjs.com/package/inkscape-parser) or run it directly via the included CLI tool.

### Install with NPM

`npm install inkscape-parser`

Then import the `parseInkscape` function from this package:

```js
import { parseInkscape } from "inkscape-parser";

// You should provide the inkscape svg as a string
const svgString = `
    <?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <!-- Created with Inkscape (http://www.inkscape.org/) -->

    <svg
    width="297mm"
    height="210mm"
    viewBox="0 0 297 210"
    version="1.1"
    id="svg5"

    [...]
`

// parseInkscape() returns an object with the parsed SVG elements
const { elements } = parseInkscape(svgString)

console.log(elements)

/* Prints something like the following:
[
    {
        "type": "text",
        "layer": "text",
        "id": "text3769",
        "x": 117.16331,
        "y": 137.12299,
        "value": "circle"
    },
    [...]
]
*/
```

`parseInkscape` also returns the page properties (width, height, etc) and the tree of unprocessed elements as parsed by [svg-parser](https://github.com/Rich-Harris/svg-parser).

```js
const { pageProperties, unprocessed } = parseInkscape(svgString)

// Print the Inkscape page properties
console.log(pageProperties)
```

Output:

```js
"pageProperties": {
    "width": "297mm",
    "height": "210mm",
    "viewBox": "0 0 297 210",
    "version": 1.1,
    "id": "svg5",
    "inkscape:version": "1.1.2 (b8e25be833, 2022-02-05)",
    "sodipodi:docname": "inkscape2.svg",
    "xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape",
    "xmlns:sodipodi": "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd",
    "xmlns": "http://www.w3.org/2000/svg",
    "xmlns:svg": "http://www.w3.org/2000/svg"
}
```

### Use via the CLI (requires Node.js)

`npx inkscape-parser ./drawing.svg ./output.json`

* the first argument is the path to any inkscape file
* the second argument is the path where the parsed data will be saved (JSON format)