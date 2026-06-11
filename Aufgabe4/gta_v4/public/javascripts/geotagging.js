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
    const mapManager = new MapManager();
    const listTags = JSON.parse(document.getElementById("map").dataset.tags || "[]");

    mapManager.initMap(lat, lon);
    mapManager.updateMarkers(lat, lon, listTags);

    document.getElementById("mapView")?.remove();
    document.getElementById("map").querySelector("span")?.remove();
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});