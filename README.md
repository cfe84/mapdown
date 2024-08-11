Mapdown is a drop-in library that converts a list of coordinates to a map, using Leaflet and OpenStreetMaps. It is primarily targetting markdown generated HTML, but can be used for any HTML document.

# Usage


Write some coordinates in your markdown, then convert to HTML using whatever means necessary.

```md
- 49.3763, -123.2726
- 49.4341, -123.4745
```

Include leaflet's CSS and Javascript references to your page.

Include mapdown and invoke it.

```html
<script src="https://cfe84.github.io/mapdown/mapdown.js"></script>
<script>mapdown()</script>
```

You can specify pass an options object, such as `mapdown({height: "300px", width: "300px"})`. The map element has class `mapdown-map` that you can use if you want to style it further.