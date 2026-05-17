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
var hasCheckedCoordinates = false;
function updateLocation() {

    if (hasCheckedCoordinates) {
        return;
    }

    // Position via findLocation auslesen
    LocationHelper.findLocation((locationHelper) => {
        // Wird dann ausgeführt sobald Location bekannt ist
        // LocationHelper hat dann diese 2 Werte, die in die jeweiligen Felder der HTML-Seite eingetragen werden können
        var lat = locationHelper.latitude;
        var long = locationHelper.longitude;
        let mapManager = new MapManager();

        document.getElementById("tagLatitude").value = lat;
        document.getElementById("tagLongitude").value = long;

        document.getElementById("discoveryLatitude").value = lat;
        document.getElementById("discoveryLongitude").value = long;

        const listTags = JSON.parse(document.getElementById("map").dataset.tags);

        mapManager.initMap(lat, long);
        mapManager.updateMarkers(lat, long, listTags);

        document.getElementById("mapView").remove();
        document.getElementById("map").querySelector("span").remove();

        hasCheckedCoordinates = true;

    });
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});