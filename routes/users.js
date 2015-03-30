var express = require('express');
var router = express.Router();

/*
 * GET user list.
 */
router.get('/userlist', function(req, res) {
  var db = req.db;
  db.collection('userlist').find().toArray(function (err, items) {
    res.json(items);
  });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
  var db = req.db;
  db.collection('userlist').insert(req.body, function(err, result) {
    res.send(
      (err === null) ? { msg: '' } : {msg: err }
    );
  });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
  var db = req.db;
  var userToDelete = req.params.id;
  var userString = 'ObjectId("' + userToDelete + '")';
  //db.collection('userList').remove({"_id": userString}, function(err, result) {
  //db.collection('userList').remove({_id: db.collection('userList').id(userString)}, function(err, result) {
    db.collection('userList').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg: userString + ' deletion error: ' + err + ' result: ' + result});
  });
});


module.exports = router;
