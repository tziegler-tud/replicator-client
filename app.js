var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

const { Picovoice } = require("@picovoice/picovoice-node");
const PvRecorder = require("@picovoice/pvrecorder-node");

const IntentManager = require('./services/IntentManager');
const LocationManager = require('./services/LocationManager');
const VoiceCommandService = require("./services/voiceCommandService");
const LightsService = require("./services/LightsService");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// index.js
var path = require('path');
global.appRoot = path.resolve(__dirname);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//init LightsService and connect to Hue Bridge
let BridgeUrl = "192.168.1.115";
let BridgeUser = "G2wTDFWTbQnqJ5VfaBfXC5G5fVcBMLim61FK0njf";
LightsService.BridgeUrl = BridgeUrl;
LightsService.BridgeUser = BridgeUser;
let lightsService = LightsService.createInstance(BridgeUrl, BridgeUser);

/*
intent manager setup
 */

let intentManager = new IntentManager();
intentManager.loadConfig("/rhinoModels/replicator_v0_3.yml");

//add handlers
const changeLightState = require("./intentHandlers/changeLightState");
intentManager.getIntent("changeLightState").addHandlerArray(changeLightState);

const changeLightStateOff = require("./intentHandlers/changeLightStateOff");
intentManager.getIntent("changeLightStateOff").addHandlerArray(changeLightStateOff);

const lightBrightnessGroup = require("./intentHandlers/lightBrightnessGroup");
intentManager.getIntent("LightBrightnessGroup").addHandlerArray(lightBrightnessGroup);

const lightBrightnessLight = require("./intentHandlers/lightBrightnessLight");
intentManager.getIntent("LightBrightnessLight").addHandlerArray(lightBrightnessLight);
//init voice command service
let voiceCommandService = new VoiceCommandService(intentManager);




/*
picovoice setup
 */

const locationManager = new LocationManager(intentManager);

let bedroom = locationManager.addLocation("bedroom", -1);
bedroom.addLightGroup("Schlafzimmer");
bedroom.addRecorder(-1);
bedroom.start();

let livingroom = locationManager.addLocation("living room", -1);
livingroom.addLightGroup("Wohnzimmer");



module.exports = app;
