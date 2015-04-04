var express = require('express');
var router = express.Router();

var basicAuth = require('basic-auth-connect');

var auth = basicAuth(function(user, pass, callback) {
 var result = (user === 'admin' && pass === 'password');
 callback(null /* error */, result);
});


/*
 * GET access list.
 */
router.get('/accessList', auth, function(req, res) {
  var db = req.db;
  db.collection('accessList').find().toArray(function (err, items) {
    res.json(items);
  });
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
