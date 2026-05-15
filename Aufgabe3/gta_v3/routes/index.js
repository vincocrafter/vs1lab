// File origin: VS1LAB A3

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 * 
 * TODO: implement the module in the file "../models/geotag.js"
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 * 
 * TODO: implement the module in the file "../models/geotag-store.js"
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');
const geoTagStore = new GeoTagStore();

const GeoTagExamples = require('../models/geotag-examples');

const store = new GeoTagStore();

// Beispieldaten in Store laden
GeoTagExamples.tagList.forEach(([name, latitude, longitude, hashtag]) => {
  store.addGeoTag(new GeoTag(name, latitude, longitude, hashtag));
});


/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', {
    taglist: [], latitude: 49.01158, longitude: 8.39343 // Standardwerte
  });
});

/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */


router.post('/tagging', (req, res) => {
  var name = req.body.has("name") ? req.body.get("name") : "";
  var latitude = req.body.has("latitude") ?
      (parseFloat(req.body.get("latitude"))).toFixed(5) : 49.01158;
  var longitude = req.body.has("longitude") ?
      (parseFloat(req.body.get("longitude"))).toFixed(5) : 8.39343;
  var hashTag = req.body.has("hashtag") ? req.body.get("hashtag") : "";

  var geoTag = new GeoTag(name, latitude, longitude, hashTag);
  geoTagStore.addGeoTag(geoTag);
  var tags = geoTagStore.getNearbyGeoTags(latitude, longitude, 20);

  res.render('index', {
    tags, latitude: latitude, longitude: longitude
  });
});

/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

router.post('/discovery', (req, res) => {
  var searchterm = req.body.has("searchterm") ? req.body.get("searchterm") : "";
  var latitude = req.body.has("latitude") ?
      (parseFloat(req.body.get("latitude"))).toFixed(5) : 49.01158;
  var longitude = req.body.has("longitude") ?
      (parseFloat(req.body.get("longitude"))).toFixed(5) : 8.39343;

  var tags = geoTagStore.searchNearbyGeoTags(latitude, longitude, 20, searchterm);

  res.render('index', {
    tags, latitude: latitude, longitude: longitude
  });
});

module.exports = router;
