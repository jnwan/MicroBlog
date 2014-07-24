/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var partials = require('express-partials');

var MongoStore = require('connect-mongo')(express);

var settings = require('./settings');

var flash = require('connect-flash');

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.session({
      secret: settings.cookieSecret,
      store: new MongoStore({
          db: settings.db
      })
  }));
  app.configure(function(){
        app.use(flash());
    });
   app.use(function(req, res, next){
        res.locals.user = req.session.user;
        res.locals.post =  req.session.post;
        var error = req.flash('error');
        res.locals.error = error.length ? error : null;
        var success = req.flash('success');
        res.locals.success = success.length ? success : null;
        next();
    });
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});
routes(app,io);
http.listen(3000, function(){
    console.log('listening on *:3000');
});
