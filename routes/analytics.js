var express = require('express');
var router = express.Router();

var basicAuth = require('basic-auth-connect');

// Authenticator - Asynchronous

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS");
  next();
});

var auth = basicAuth(function(user, pass, callback) {
 var result = (user === 'admin' && pass === 'password');
 callback(null /* error */, result);
});

/*
 * GET access list.
 */
router.get('/accessList', auth, function(req, res) {
  var db = req.db; 

  db.collection('accessList').find({},{limit:25}).sort({accessInfoTime:-1}).toArray(function (err, items) {
      res.json(items);
  });
});

/*
 * GET a page of access list.
 */
router.get('/accessList/:page', auth, function(req, res) {
  var db = req.db;
 
  db.collection('accessList').find({},{skip:(25 * req.params.page), limit:25}).sort({accessInfoTime:-1}).toArray(function (err, items) {
    res.json(items);
  });
});

/*
 * GET unique entries of type specified.
 */
router.get('/unique/:type', auth, function(req, res) {
    var db = req.db;
    // console.log(req.params.type);
    db.collection('accessList').distinct(req.params.type, (function (err, items) {
    if (err) { 
        console.log(err);
        return;
    }
    res.json(items);
    }));
});

/*
 * COUNT entries of type and value specified.
 */
router.get('/count/:type/:str', auth, function(req, res) {
    var db = req.db;
    //eval('var tempType = "' + req.params.type + '"'); <- Probably would have worked and been easier to read!
    
    //if they request /all/all return the total count
    if (req.params.type === "all") {
        db.collection('accessList').count(function (err, count) { res.json(count); });
    }
    // Otherwise we need an eval because type is interpreted literally not as a variable
    else {
        var findStr = req.params.type + ': ' + '"' + req.params.str + '"';
        eval("db.collection('accessList').count({" + findStr + "}, function (err, count) { res.json(count); });");
    }
});

/*
 * GET PROPERTY values based on first entry of type and value specified.
 */
router.get('/:type/:str', auth, function(req, res) {
    var db = req.db;
    //eval('var tempType = "' + req.params.type + '"'); <- Probably would have worked and been easier to read!

	var findStr = req.params.type + ': ' + '"' + req.params.str + '"';
	eval("db.collection('accessList').find({" + findStr + "},{limit: 1}).toArray(function(err,item) {res.json(item);});");

});

/*
 * Post to access list.
 */
router.post('/addAccess', function(req, res) {
  var db = req.db;
  db.collection('accessList').insert(req.body, function(err, result) {
    res.send(
      (err === null) ? { msg: '' } : {msg: err }
    );
  });
});

/*
 * DELETE to delete access entry.
 */
router.delete('/deleteAccess/:id', auth, function(req, res) {
  var db = req.db;
  var AccesssToDelete = req.params.id;
  db.collection('accessList').removeById(AccesssToDelete, function(err, result) { 
        res.send((result === 1) ? { msg: '' } : { msg: AccesssToDelete + ' deletion error: ' + err + ' result: ' + result});
  });
});

module.exports = router;
