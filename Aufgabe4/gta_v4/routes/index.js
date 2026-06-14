// File origin: VS1LAB A3, A4

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
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');
const GeoTagExamples = require('../models/geotag-examples');

const SEARCH_RADIUS = 0.1;

const store = new GeoTagStore();

// Beispieldaten in Store laden
GeoTagExamples.tagList.forEach(([name, latitude, longitude, hashtag]) => {
  store.addGeoTag(new GeoTag(name, latitude, longitude, hashtag));
});

// App routes (A3)

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
    taglist: [],
    latitude: '',
    longitude: ''
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
  var name = req.body.name ? req.body.name : "";
  var latitude = req.body.latitude ?
      (parseFloat(req.body.latitude)).toFixed(5) : 49.01158;
  var longitude = req.body.longitude ?
      (parseFloat(req.body.longitude)).toFixed(5) : 8.39343;
  var hashTag = req.body.hashtag ? req.body.hashtag : "";

  var geoTag = new GeoTag(name, latitude, longitude, hashTag);
  store.addGeoTag(geoTag);
  var tags = store.getNearbyGeoTags(latitude, longitude, SEARCH_RADIUS);

  res.render('index', {
    taglist: tags, latitude: latitude, longitude: longitude
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
  var searchterm = req.body.searchterm ? req.body.searchterm : "";
  var latitude = req.body.latitude ?
      (parseFloat(req.body.latitude)).toFixed(5) : 49.01158;
  var longitude = req.body.longitude ?
      (parseFloat(req.body.longitude)).toFixed(5) : 8.39343;

  var tags = store.searchNearbyGeoTags(latitude, longitude, SEARCH_RADIUS, searchterm);

  res.render('index', {
    taglist: tags, latitude: latitude, longitude: longitude
  });
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get('/api/geotags', (req, res) => {
  var searchterm = req.query.searchterm ? req.query.searchterm : "";
  var latitude = req.query.latitude ?
      (parseFloat(req.query.latitude)).toFixed(5) : 49.01158;
  var longitude = req.query.longitude ?
      (parseFloat(req.query.longitude)).toFixed(5) : 8.39343;

  var tags = store.searchNearbyGeoTags(latitude, longitude, SEARCH_RADIUS, searchterm);

  res.json(tags);
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post('/api/geotags', (req, res) => {
  var id = store.addGeoTag(req.body);
  res.header('Location', '/api/geotags/' + id);
  res.status(201).json(store.getGeoTagByID(id));
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get('/api/geotags/:id', (req, res) => {
  res.json(store.getGeoTagByID(req.params.id));
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

router.put('/api/geotags/:id', (req, res) => {
  store.setGeoTag(req.body, req.params.id);
  res.json(store.getGeoTagByID(req.params.id));
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete('/api/geotags/:id', (req, res) => {
  var id = req.params.id ? req.params.id : 0;
  var geotag = store.getGeoTagByID(id);
  store.removeGeoTag(Number(id))
  res.json(geotag);
});

module.exports = router;
