function mapdown(options = {}) {
    const width = options.width || "500px";
    const height = options.height || "300px";

    function process() {
        const coordinatesLists = findCoordinatesLists();
        console.log(coordinatesLists);
        coordinatesLists.forEach(convertListToMap);
    }

    function findCoordinatesLists() {
        const lists = [...document.getElementsByTagName("ul")]
            .map(getCoordinates)
            .filter(coordinates => coordinates !== undefined);
        return lists;
    }

    function getCoordinates(ul) {
        const listItems = [...ul.getElementsByTagName("li")];
        if (listItems.length === 0) {
            return undefined;
        }
        const latLongs = listItems.map(getLatLong);
        const hasSomeNotLatLong = latLongs.indexOf(undefined) >= 0;
        if (hasSomeNotLatLong) {
            return undefined;
        }
        return {
            element: ul,
            latLongs
        };
    }
    
    function getLatLong(element) {
        const text = element.innerText;
        const regex = /^(-?\d{1,3}\.?\d*)\s*,\s*(-?\d{1,3}\.?\d*)(?: - (.*))?$/;
        const res = regex.exec(text);
        if (!res) {
            return undefined;
        }
        const lat = Number.parseFloat(res[1]);
        const long = Number.parseFloat(res[2]);
        const comment = res[3];
        return {
            latlong: [lat, long],
            comment,
        };
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
            map.setView(latLongs[0], 11);
        } else {
            // track
            const polyline = L.polyline(latLongs.map(latLong => latLong.latlong), {color: "red"}).addTo(map);
            map.fitBounds(polyline.getBounds());
        }
        latLongs
            .filter(latLong => latLong.comment)
            .forEach(latLong => {
                map.openPopup(latLong.comment, latLong.latlong);
            });
    }

    process();
}