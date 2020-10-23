var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
app.use(helmet());
var session = require('express-session');
var LokiStore = require('connect-loki')(session);
var flash = require('connect-flash');
var db = require('./lib/db');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
  store: new LokiStore(),
  secret: 'asdfalksdjflakdsjl@#%',
  resave: false,
  saveUninitialized: true
  }))
  
app.use(flash());

var passport = require('./lib/passport')(app);

app.get('*', function(request, response, next){
  request.list = db.get('topics').value();
  next();
});

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth')(passport);
//const { response } = require('express');

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
