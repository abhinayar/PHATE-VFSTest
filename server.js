const port = process.env.PORT || 3000,
  express = require('express'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  MemoryStore = require('memorystore')(session),
  path = require('path');

// Dotenv config
require('dotenv').config({ path: './.safe_env' })

// Other env vars
const dev = process.env.NODE_ENV !== 'production'

// Setup express app
const app = express();
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000, limit: '75mb' }))
app.use(cookieParser(process.env.SECRET))
app.use(session({
  cookie: {
    maxAge: 2147483640
  },
  store: new MemoryStore({ checkPeriod: 2147483640 }),
  secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false
}))

// Make the app listen
const server = app.listen(port, (err) => {
  if (err)
    console.log(err)
  console.log(`App is running on port: ${port}`);
});

// Fix CORS issues https://enable-cors.org/server_expressjs.html
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000")
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

// Setup Socket.io for Py message streaming
const io = require('socket.io').listen(server);

//Setup routing
io.of('/test_python').on('connection', (socket) => {
  console.log("User connected to WebSocket");
  socket.emit("message", "Establishing Socket Handshake");
  socket.emit("code", 200);

  socket.on("start_processing", (payload) => {
    let errorFlag = false;

    const spawn_install = require('child_process').spawn,
      pyInstallProcess = spawn_install("pip", ["install", "-r", "./requirements.txt"]),
      output = pyInstallProcess.stdout,
      error = pyInstallProcess.stderr;

    pyInstallProcess.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
    });

    console.log("Processing has been started");
    console.log("Beginning PHATE processing");

    const spawn = require('child_process').spawn,
      pyProcess = spawn("python", ["./scripts/" + process.env.PYTHON_SCRIPT_NAME]),
      output = pyProcess.stdout,
      error = pyProcess.stderr;

    output.on('data', (data) => {
      let str = data.toString();
      console.log(`Python data: ${ str }`);
      console.log(str)
      socket.emit("message", "MESSAGE: " + str)
    })

    error.on('data', (data) => {
      let str = data.toString();
      console.log(str)
      errorFlag = true;
      socket.emit("message", "ERROR: " + str)
    })

    pyProcess.on('exit', (code, signal) => {
      let msg = `EXITED PROCESS: ${code} - ${signal}`;
      console.log(msg)

      if (!errorFlag)
        //socket.emit("message", msg);
        console.log(msg)
      else
        errorFlag = false;
    });
  });

  socket.on('disconnect', () => {
    console.log("Disconnect message received");
    console.log("Socket disconnected");
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/app/index.html'));
})
