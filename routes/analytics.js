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

router.post('/addAccess', function(req, res) {
  var db = req.db;
  db.collection('accessList').insert(req.body, function(err, result) {
    res.send(
      (err === null) ? { msg: '' } : {msg: err }
    );
  });
});

module.exports = router;
