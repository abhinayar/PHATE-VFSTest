'use strict';

var port = process.env.PORT || 3000,
  express = require('express'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  MemoryStore = require('memorystore')(session),
  path = require('path');

// Dotenv config
require('dotenv').config({ path: './.safe_env' });

// Other env vars
var dev = process.env.NODE_ENV !== 'production';

// Setup express app
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000, limit: '75mb' }));
app.use(cookieParser(process.env.SECRET));
app.use(session({
  cookie: {
    maxAge: 2147483640
  },
  store: new MemoryStore({ checkPeriod: 2147483640 }),
  secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false
}));

// Make the app listen
var server = app.listen(port, function (err) {
  if (err) console.log(err);
  console.log('App is running on port: ' + port);
});

// Fix CORS issues https://enable-cors.org/server_expressjs.html
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Setup Socket.io for Py message streaming
var io = require('socket.io').listen(server);

// Install PIP dependencies from the requirements.txt root file

var _require = require('child_process');

var spawn = _require.spawn;
var spawnSync = _require.spawnSync;

// Use the synchronous version of the Spawn function
// This ensures that the rest of the event loop does not execute till our
// dependencies have been installed. For more info:
// https://medium.freecodecamp.org/node-js-child-processes-everything-you-need-to-know-e69498fe970a

pyInstallProcess = spawn('pip install -r requirements.txt', {
  shell: true
});

pyInstallProcess.stdout.on('data', (data) => {
  console.log(`PIP Install Out:\n${data}`);
});

pyInstallProcess.stderr.on('data', (data) => {
  console.log(`PIP Install Error:\n${data}`);
});

pyInstallProcess.on('exit', (code, signal) => {
  console.log(`PIP install process exited with ${ code } ${ signal }`);
});

//console.log(pyInstallProcess.output);

// Setup routing
io.of('/test_python').on('connection', function (socket) {
  console.log("User connected to WebSocket");
  socket.emit("message", "Establishing Socket Handshake");
  socket.emit("code", 200);

  socket.on("start_processing", function (payload) {
    var errorFlag = false;

    console.log("Processing has been started");
    console.log("Beginning PHATE processing");

    var pyProcess = spawn('python ../scripts/' + process.env.PYTHON_SCRIPT_NAME, {
        shell: true,
        cwd: './spoof_uploads'
      }),
      output = pyProcess.stdout,
      error = pyProcess.stderr;

    output.on('data', function (data) {
      var str = data.toString();
      console.log('Python data: ' + str);
      console.log(str);
      socket.emit("message", "MESSAGE: " + str);
    });

    error.on('data', function (data) {
      var str = data.toString();
      console.log(str);
      errorFlag = true;
      socket.emit("message", "ERROR: " + str);
    });

    pyProcess.on('exit', function (code, signal) {
      var msg = 'EXITED PROCESS: ' + code + ' - ' + signal;
      console.log(msg);

      if (!errorFlag)
        //socket.emit("message", msg);
        console.log(msg);
      else errorFlag = false;
    });
  });

  socket.on('disconnect', function () {
    console.log("Disconnect message received");
    console.log("Socket disconnected");
  });
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/app/index.html'));
});
