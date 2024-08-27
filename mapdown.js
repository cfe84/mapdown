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
        const innerHTML = element.innerHTML;
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
        if (latLongs.length > 0) {
            // Disgusting, will fix when we make GPX better.
            latLongs[0].download = { src, innerHTML };
        }
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
        const mapDiv = document.createElement("div");
        div.appendChild(mapDiv);
        mapDiv.style.height = height;
        mapDiv.style.width = width;
        div.style.width = width;
        mapDiv.className = "mapdown-map";
        element.replaceWith(div);
        const map = L.map(mapDiv);
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
        const downloadableLL = latLongs
            .filter(latLong => latLong.download);
        if (downloadableLL.length > 0) {
            const ul = document.createElement("ul");
            ul.style.listStyle = "none";
            ul.style.display = "inline-block";
            ul.style.padding = 0;
            ul.style.margin = 0;
            ul.style.width = "100%";
            ul.style.textAlign = "center";
            ul.className = "mapdown-ul";
            div.appendChild(ul);
            downloadableLL.forEach(downloadable => {
                const item = document.createElement("li");
                item.className = "mapdown-li";
                const link = document.createElement("a");
                link.className = "mapdown-a";
                link.style.color = "#999";
                link.style.fontStyle = "italic";
                link.href = downloadable.download.src;
                link.innerHTML = downloadable.download.innerHTML;
                item.appendChild(link);
                ul.appendChild(item);
            });
        }
    }

    processAsync().then();
}