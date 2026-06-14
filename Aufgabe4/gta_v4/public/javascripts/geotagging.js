// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console.
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...

console.log("The geoTagging script is going to start...");

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.
var GEOLOCATION_API = {
    getCurrentPosition: function (onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1775140116396
        });
    }
};

// This is the real API.
// If there are problems with it, comment out the line.
GEOLOCATION_API = navigator.geolocation;

class GeoTag {
    constructor(name, latitude, longitude, hashtag) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.hashtag = hashtag;
    }
}

let mapManager;

function updateLocation() {
    const latField = document.getElementById("tagLatitude");
    const lonField = document.getElementById("tagLongitude");

    if (latField.value && lonField.value) {
        // Koordinaten kommen schon aus dem Formular (Server-Echo nach Submit)
        // → Geolocation überspringen
        initMapAndMarkers(parseFloat(latField.value), parseFloat(lonField.value));
    } else {
        // Felder sind leer (Erstaufruf) → Geolocation API fragen
        LocationHelper.findLocation((locationHelper) => {
            const lat = locationHelper.latitude;
            const lon = locationHelper.longitude;

            document.getElementById("tagLatitude").value = lat;
            document.getElementById("tagLongitude").value = lon;
            document.getElementById("discoveryLatitude").value = lat;
            document.getElementById("discoveryLongitude").value = lon;

            initMapAndMarkers(parseFloat(lat), parseFloat(lon));
        });
    }
}

function initMapAndMarkers(lat, lon) {
    mapManager = new MapManager();
    const listTags = JSON.parse(document.getElementById("map").dataset.tags || "[]");

    mapManager.initMap(lat, lon);
    mapManager.updateMarkers(lat, lon, listTags);

    document.getElementById("mapView")?.remove();
    document.getElementById("map").querySelector("span")?.remove();
}

function getDiscoveryLocation() {
    return {
        latitude: document.getElementById("discoveryLatitude").value,
        longitude: document.getElementById("discoveryLongitude").value
    };
}

function renderDiscoveryResults(tags) {
    const results = document.getElementById("discoveryResults");
    results.replaceChildren();

    tags.forEach((tag) => {
        const item = document.createElement("li");
        item.textContent = `${tag.name} ( ${tag.latitude},${tag.longitude}) ${tag.hashtag}`;
        results.appendChild(item);
    });
}

function updateDiscoveryWidget(tags, latitude, longitude) {
    renderDiscoveryResults(tags);
    document.getElementById("map").dataset.tags = JSON.stringify(tags);

    if (!mapManager) {
        initMapAndMarkers(parseFloat(latitude), parseFloat(longitude));
    }

    mapManager.updateMarkers(parseFloat(latitude), parseFloat(longitude), tags);
}

async function fetchDiscoveryResults(latitude, longitude, searchterm = "") {
    const params = new URLSearchParams({
        latitude,
        longitude,
        searchterm
    });
    const response = await fetch(`/api/geotags?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Discovery request failed: ${response.status}`);
    }

    return response.json();
}

function registerTaggingForm() {
    const form = document.getElementById("tag-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const geoTag = new GeoTag(
            document.getElementById("name").value,
            document.getElementById("tagLatitude").value,
            document.getElementById("tagLongitude").value,
            document.getElementById("tagHashtag").value
        );

        const response = await fetch("/api/geotags", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(geoTag)
        });

        if (!response.ok) {
            throw new Error(`Tagging request failed: ${response.status}`);
        }

        document.getElementById("discoveryLatitude").value = geoTag.latitude;
        document.getElementById("discoveryLongitude").value = geoTag.longitude;

        const tags = await fetchDiscoveryResults(geoTag.latitude, geoTag.longitude);
        updateDiscoveryWidget(tags, geoTag.latitude, geoTag.longitude);
        form.reset();
        document.getElementById("tagLatitude").value = geoTag.latitude;
        document.getElementById("tagLongitude").value = geoTag.longitude;
    });
}

function registerDiscoveryForm() {
    const form = document.getElementById("discoveryFilterForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        const { latitude, longitude } = getDiscoveryLocation();
        const searchterm = document.getElementById("discoverySearchTerm").value;
        const tags = await fetchDiscoveryResults(latitude, longitude, searchterm);
        updateDiscoveryWidget(tags, latitude, longitude);
    });
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    registerTaggingForm();
    registerDiscoveryForm();
});
