import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';

import {PvRecorder} from "@picovoice/pvrecorder-node";

import VoiceRecognitionService from "./services/voiceRecognitionService.js";
import CommunicationService from "./services/CommunicationService.js";
import VoiceCommandService from "./services/voiceCommandService.js";
import InterfaceService from "./services/InterfaceService.js";
import SettingsService from "./services/SettingsService.js";

// var sassMiddleware = require('node-sass-middleware');
// const LocationManager = require('./services/LocationManager');


import htmlRouter from './routes/html/index.js';
import apiRouter from './routes/api/v1/index.js';
import servicesRouter from './routes/api/v1/services.js';
import ServerCommandService from "./services/ServerCommandService.js";




var app = express();

// index.js
const __dirname = path.dirname(fileURLToPath(import.meta.url));
global.appRoot = path.resolve(__dirname);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(sassMiddleware({
//   src: path.join(__dirname, 'public'),
//   dest: path.join(__dirname, 'public'),
//   indentedSyntax: true, // true = .sass and false = .scss
//   sourceMap: true
// }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', htmlRouter);
app.use('/api/v1/', apiRouter);
app.use('/api/v1/services', servicesRouter);

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

//load settings from db
let settingsService = SettingsService.start({});

//load server communication module
let communicationService= CommunicationService.start();


//init voice command service
let voiceCommandService = VoiceCommandService.start();

//init Interface Service
let interfaceService = InterfaceService.start();
// interfaceService.addLedInterface({ledAmount: 3});



const devices = PvRecorder.getAvailableDevices();

//start voice recognition service
const voiceRecognitionService = VoiceRecognitionService.start();

//start server command service
const serverCommandService = ServerCommandService.start();

//wait for all services to start
Promise.all([settingsService, communicationService, voiceCommandService, interfaceService, voiceRecognitionService, serverCommandService])
    .then(results => {
      InterfaceService.handleEvent(InterfaceService.events.SETUPCOMPLETE);
    })
    .catch(err => {
      console.error("System startup failed: Some services failed to initialize.");
      console.error(err);
    })


export default app;