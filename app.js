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

  
var app = express();


var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.set('port', process.env.PORT || 3000);
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


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

// Make our db accessible to our router
app.use(function(req,res,next) {
  req.db = db;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/analytics', analytics);

io.use(function(socket, next) {
  //var handshake = socket.request;
  // make sure the handshake data looks good as before
  // if error do this:
    // next(new Error('not authorized');
  // else just call next
  next();
});

io.sockets.on('connection', function (socket) {
    var ip = socket.handshake.address;
    
    socket.on('message', function (message) {
        console.log('Got message from: ' + ip);
        var url = message;
        io.sockets.emit('pageview', { 'connections': Object.keys(io.sockets.connected).length, 'ip': '***.' + ip.substring(ip.lastIndexOf('.') - 6), 'url': url, 'location': geoip.lookup(ip), 'xdomain': socket.handshake.xdomain, 'timestamp': new Date()});
    });

    socket.on('disconnect', function () {
        console.log('Socket disconnection from: ' + ip + ' in: ' + geoip.lookup(ip).country + '/' + geoip.lookup(ip).region);
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
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
