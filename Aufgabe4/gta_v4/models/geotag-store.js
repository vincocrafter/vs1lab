// File origin: VS1LAB A3
const GeoTag = require("./geotag.js");
const GeoTagExamples = require("./geotag-examples.js");
const geo = require("ejs");
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

    /** @type {Map<number, GeoTag>} */
    #geoTagStore = new Map(); // nur in Store
    #id = 0;

    /**
     * Add a geotag to the store
     *
     * @param {GeoTag} geoTag The tag to add
     */

    addGeoTag(geotag) {
        const assignedId = this.#id++;
        this.#geoTagStore.set(assignedId, geotag);
        return assignedId;
    }

    /**
     * Remove a geo-tag from the store by name
     * @param {string} geoTagName The name of the geo-tag to remove
     */

    removeGeoTag(name) {
        this.#geoTagStore.delete(this.#geoTagStore.findIndex(geotag => geotag.name === name));
    }

    /**
     * Remove a geo-tag from the id
     * @param {string} geoTagName The name of the geo-tag to remove
     */

    removeGeoTag(id) {
        this.#geoTagStore.delete(id);
    }

    /**
     * Get all geotags in the proximity of a location.
     * @param {int} latitude Latitude of the location
     * @param {int} longitude Longitude of the location
     * @param {int} radius Proximity around the location.
     * @return {GeoTag[]} Array of GeoTags found.
     */

    getNearbyGeoTags(latitude, longitude, radius) {
        return Array.from(this.#geoTagStore.values()).filter(geotag => {
            const distance = this.calculateDistance(latitude, longitude, geotag.latitude, geotag.longitude);
            return distance <= radius;
        });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = lat1 - lat2;
        const dLon = lon1 - lon2;
        return Math.sqrt(dLat * dLat + dLon * dLon);
    }

    /**
     * Search for geotags in the proximity of a location that match a keyword.
     * @param {string} keyword Keyword to search for in name and hashtag fields of geotags
     * @param {int} distance Proximity around the location.
     * @return {GeoTag[]} Array of GeoTags found.
     */


    searchNearbyGeoTags(latitude, longitude, radius, keyword) {
        const term = keyword.toLowerCase();
        return this.getNearbyGeoTags(latitude, longitude, radius).filter(geotag => {
            return geotag.name.toLowerCase().includes(term)
                || geotag.hashtag.toLowerCase().includes(term);
        });
    }

    getGeoTagByID(id) {
        return this.#geoTagStore.get(Number(id));
    }

    setGeoTag(geotag, id) {
        this.#geoTagStore.set(Number(id), geotag);
    }
}

module.exports = InMemoryGeoTagStore
