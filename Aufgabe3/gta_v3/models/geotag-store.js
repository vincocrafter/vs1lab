// File origin: VS1LAB A3
const GeoTag = require("./geotag.js");
const GeoTagExamples = require("./geotag-examples.js");
/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 *
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 *
 * Provide a method 'addGeoTag' to add a geotag to the store.
 *
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 *
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 *
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields.
 */
class InMemoryGeoTagStore {

    #geoTagStore = []; // nur in Store

    addGeoTag(geotag) {
        this.#geoTagStore.push(geotag);

        //Speichert die veränderten Daten im dataset.
        document.getElementById("map").dataset.tags = JSON.stringify(this.#geoTagStore);
    }

    removeGeoTag(name) {
        this.#geoTagStore = this.#geoTagStore.filter(geotag => geotag.name !== name);
    }

    getNearbyGeoTags(latitude, longitude, radius) {
        return this.#geoTagStore.filter(geotag => {
            const distance = this.calculateDistance(latitude, longitude, geotag.latitude, geotag.longitude);
            return distance <= radius;
        });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = lat1 - lat2;
        const dLon = lon1 - lon2;
        return Math.sqrt(dLat * dLat + dLon * dLon);
    }


    searchNearbyGeoTags(latitude, longitude, radius, keyword) {
        const term = keyword.toLowerCase();
        return this.getNearbyGeoTags(latitude,longitude, radius).filter(geotag => {
            return geotag.name.toLowerCase().includes(term)
                || geotag.hashtag.toLowerCase().includes(term);
        });
    }

}

module.exports = InMemoryGeoTagStore
