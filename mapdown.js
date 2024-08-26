function mapdown(options = {}) {
    const width = options.width || "500px";
    const height = options.height || "300px";

    async function processAsync() {
        const coordinatesLists = await findCoordinatesListsAsync();
        coordinatesLists.forEach(convertListToMap);
    }

    async function findCoordinatesListsAsync() {
        const lists = (await Promise.all([...document.getElementsByTagName("ul")]
            .map(getCoordinatesAsync)))
            .filter(coordinates => coordinates !== undefined);
        return lists;
    }

    async function getCoordinatesAsync(ul) {
        const listItems = [...ul.getElementsByTagName("li")];
        if (listItems.length === 0) {
            return undefined;
        }
        const latLongs = (await Promise.all(listItems.map(getLatLongAsync))).flat();
        const hasSomeNotLatLong = latLongs.indexOf(undefined) >= 0;
        if (hasSomeNotLatLong) {
            return undefined;
        }
        return {
            element: ul,
            latLongs
        };
    }
    
    async function getLatLongAsync(element) {
        if (element.children.length === 1 && element.children[0].tagName === "A") {
            return getGpxLatLongsAsync(element.children[0]);
        }
        const text = element.innerText;
        const regex = /^(-?\d{1,3}\.?\d*)\s*,\s*(-?\d{1,3}\.?\d*)(?: - (.*))?$/;
        const res = regex.exec(text);
        if (!res) {
            return undefined;
        }
        const lat = Number.parseFloat(res[1]);
        const long = Number.parseFloat(res[2]);
        const comment = res[3];
        return [{
            latlong: [lat, long],
            comment,
        }];
    }

    async function getGpxLatLongsAsync(element) {
        const src = element.href;
        if (!src || src.toLowerCase().indexOf(".gpx") < 0) {
            return undefined;
        }
        const content = await fetchXmlAsync(src);
        if (!content) {
            return undefined;
        }
        // This is not great. We should honor the segments, and instead this will display all of them linked. For the general
        // case it's good enough, but there would be a sense in making them individual.
        const trackPoints = [...content.getElementsByTagName("trkpt")];
        const latLongs = trackPoints.map(trackPoint => {
            // Catching all string items.
            const descriptions = ["name", "cmt", "desc"].map(tag => [...trackPoint.getElementsByTagName(tag)])
                .flat()
                .filter(el => !!el)
                .map(el => el.textContent);
            const comment = descriptions.length > 0 ? descriptions.join(", ") : undefined;
            return {
                comment,
                latlong: [ trackPoint.getAttribute("lat"), trackPoint.getAttribute("lon") ]
            }
        });
        return latLongs;
    }

    async function fetchXmlAsync(src) {
        try {
            const res = await fetch(src);
            const content = await res.text();
            const parser = new DOMParser();
            return parser.parseFromString(content, "text/xml");
        } catch (err) {
            console.error(`Error fetching GPX ${src}: ${err}`);
            return undefined;
        }
    }

    function convertListToMap({ element, latLongs }) {
        const div = document.createElement("div");
        div.style.height = height;
        div.style.width = width;
        div.className = "mapdown-map";
        element.replaceWith(div);
        const map = L.map(div);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        if (latLongs.length === 1) {
            // marker
            L.marker(latLongs[0].latlong).addTo(map);
            map.setView(latLongs[0].latlong, 11);
        } else {
            // track
            const polyline = L.polyline(latLongs.map(latLong => latLong.latlong), {color: "red"}).addTo(map);
            map.fitBounds(polyline.getBounds());
            map.zoomOut(1);
        }
        latLongs
            .filter(latLong => latLong.comment)
            .forEach(latLong => {
                L.marker(latLong.latlong)
                    .addTo(map)
                    .bindTooltip(latLong.comment)
                    .openTooltip();
            });
    }

    processAsync().then();
}