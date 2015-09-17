"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nib = require('nib');
var stylus = require('stylus');
var connect = require('connect');
var vhost = require('vhost');
var geoip = require('geoip-lite'); 
var http = require('http');

// Database
var mongo = require('mongoskin');
var db = mongo.db('mongodb://localhost:27017/website2', {native_parser:true});

var routes = require('./routes/index');
var users = require('./routes/users');
var analytics = require('./routes/analytics');

var geoffapp = connect();
var mainapp = connect();

geoffapp.use(function(req, res, next) {
    var username = 'geoffrey';
    
    req.originalUrl = req.url;
    if (req.url === '/')
    {
        console.log('Redirecting from: ' + req.url);
        req.url = req.url + username;
    }
    
    next();
});
  
// var app = express(options);
var app = express();

// app.set('port', process.env.PORT || 3000);

var port = 3000;

var server = http.createServer(app).listen(port, function() {
    console.log('Express server listening on port ' + port);

});

var io = require('socket.io').listen(server);

// add vhost routing for main app
app.use(vhost('geoffrey.webhop.me', geoffapp));
app.use(vhost('geoff.webhop.me', geoffapp));
app.use(vhost('firetree.ddns.net', mainapp));

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib());
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware({
    src: __dirname + '/views/stylesheets',
    dest: __dirname + '/public/stylesheets',
    compile: compile
})); 

app.use(express.static(path.join(__dirname, 'public')));

// Allow other domains access
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Make our db accessible to our router
app.use(function(req,res,next) {
  req.db = db;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/analytics', analytics);

io.set("origins = *");

io.use(function(socket, next) {
  //var handshake = socket.request;
  // make sure the handshake data looks good as before
  // if error do this:
    // next(new Error('not authorized');
  // else just call next
  next();
});

io.sockets.on('connection', function (socket) {
    		
    socket.on('message', function (message) {		
        //console.log("Got message: " + message);		
        ip = socket.handshake.address;		
        url = message;		
        io.sockets.emit('pageview', { 'connections': Object.keys(io.sockets.connected).length, 'ip': 'heroku.com', 'url': url, 'xdomain': socket.handshake.xdomain, 'timestamp': new Date()});		
    });		
    
    socket.on('disconnect', function () {		
        console.log("Socket disconnected");		
        io.sockets.emit('pageview', { 'connections': Object.keys(io.sockets.connected).length});		
    });		
		
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
    res.status(500);
    res.render('error', {
        message: 'If you came here looking for demos, sorry, but there\'s only two for now.',
        error: err
    });
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    // res.status(err.status || 500);
    res.status(err.status);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  // res.status(err.status || 500);
  res.status(err.status);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
