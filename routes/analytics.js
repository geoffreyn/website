var express = require('express');
var router = express.Router();

/*
 * GET access list.
 */
router.get('/accessList', function(req, res) {
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
router.delete('/deleteAccess/:id', function(req, res) {
  var db = req.db;
  var AccesssToDelete = req.params.id;
  db.collection('accessList').removeById(AccesssToDelete, function(err, result) { 
        res.send((result === 1) ? { msg: '' } : { msg: AccesssToDelete + ' deletion error: ' + err + ' result: ' + result});
  });
});

module.exports = router;
