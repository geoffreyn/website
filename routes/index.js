var express = require('express');
var router = express.Router();
var gm = require('gm');
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

/* GET Geoff's link. */
router.get('/links',function(req, res, next) {
  res.render('links', { title: 'Links listed on my website' });
});

// Authenticator - Asynchronous
var auth = basicAuth(function(user, pass, callback) {
 var result = (user === 'admin' && pass === 'password');
 callback(null /* error */, result);
});

/* New Admin page. */
router.get('/admin',auth,function(req, res, next) {
    res.render('admin', {title: 'Administration'});
});

/* GET blank layout for those authorized. */
router.get('/layout',auth,function(req, res, next) {
  res.render('layout', { title: 'Blank layout for the curious' });
});

/*
gm('/public/images/Geoffrey_portrait.jpg')
.resize(353, 257)
.charcoal(10)
.autoOrient()
.write(writeStream, function (err) {
  if (!err) console.log(' hooray! ');
});
*/

router.get('/images/Geoffrey_portrait_small.jpg',function(req, res, next) {
    gm('/images/Geoffrey_portrait_small.jpg').resize(353, 257).sepia().autoOrient().write(res, function(err) {
        if(err) {console.log(err.message)} else {console.log(res)}
    });
});

module.exports = router;
