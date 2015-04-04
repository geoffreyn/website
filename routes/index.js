var express = require('express');
var router = express.Router();
var basicAuth = require('basic-auth-connect');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebApp Listing' });
});

/* GET home page2. */
router.get('/index', function(req, res, next) {
  res.render('index', { title: 'WebApp Listing' });
});

/* GET Geoff's page. */
router.get('/geoffrey',function(req, res, next) {
  res.render('geoffrey', { title: 'Geoffrey Newman' });
});

/* GET Beta version of Geoff's page. */
router.get('/beta',function(req, res, next) {
    res.render('beta', { title: 'Wacky Javascript enhanced version of Geoff-Page' });
});

/* GET Geoff's link. */
router.get('/links',function(req, res, next) {
  res.render('links', { title: 'Links listed on my website' });
});

/* GET Geoff's embeded flickr album. */
router.get('/flickr_album',function(req, res, next) {
  res.render('flickr_album', { title: 'My Flickr Album' });
});

// Authenticator - Asynchronous
var auth = basicAuth(function(user, pass, callback) {
 var result = (user === 'admin' && pass === 'password');
 callback(null /* error */, result);
});

/* GET Admin page. */
router.get('/admin',auth,function(req, res, next) {
    res.render('admin', {title: 'Access Analytics'});
});

/* GET blank layout for those authorized. */
router.get('/layout',auth,function(req, res, next) {
  res.render('layout', { title: 'Blank layout for the curious' });
});

/* GET Plotting page */
router.get('/plots',function(req, res, next) {
  res.render('plotting', { title: 'Data Visualization' });
});

module.exports = router;
