Mapdown is a drop-in library that converts a list of coordinates to a map, using [Leaflet](https://leafletjs.com) and [OpenStreetMap](https://www.openstreetmap.org). It is primarily targetting markdown generated HTML, but can be used for any HTML document.

Checkout the [demo](https://cfe84.github.io/mapdown/demo.html)

# Usage

Write some coordinates in your markdown, then convert to HTML using whatever means necessary. You can add a popup on a specific node using ` - whatever comment you want`.

```md
- 49.3763, -123.2726
- 49.4341, -123.4745 - A comment on that point.
```

You can also add a GPX trace by adding a link to it in a list:

```md
- [](./something.gpx)
```

_Note: if there's anything in the list that is not a GPX trace or a set of coordinate, mapdown will leave it alone_.

_Note 2: GPX support is partial at the moment. It's picking all points from all traces and linking them together. You can add a popup by adding one of the following elements to the point where you want it to appear: `<name>`, `<desc>`, or `cmt`._

Include leaflet's CSS and Javascript references to your page.

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
```

Include mapdown and invoke it.

```html
<script src="https://cfe84.github.io/mapdown/mapdown.js"></script>
<script>mapdown()</script>
```

You can specify pass an options object, such as `mapdown({height: "300px", width: "300px"})`. You can pass a `style` parameter as well, in which case all the other style options are ignored. Finally, the map element has class `mapdown-map` that you can use if you want to style it with CSS.

# Note

This script is a very simple wrapper. All the hard work of rendering maps is done through OpenStreetMap and Leaflet. These are the real heroes.