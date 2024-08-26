       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""/>


# Demo of mapdown

This is my trip:

- 49.3763, -123.2726
- 49.4341, -123.4745 - A note about that point
- 49.4741, -123.7661

This is just a mark:

- 49.3763, -123.2726

That's a GPX trace: 

- [](./example.gpx)

        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
        <script src="./mapdown.js"></script>
        <script>window.onload = () => mapdown()</script>