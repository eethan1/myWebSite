'use strict'
// You should use your SEC.js. See SEC-default.js
const SEC = require('./SEC')
// You should use your config.js. See config-default.js
global.config = require('./config')

var express = require('express')
// var handlebars = require('express-handlebars').create({ defaultLayout:'main'});
var cors = require('cors')
var cookieParser = require('cookie-parser')
var helmet = require('helmet')
const contentSecurityPolicy = require('helmet-csp')
var session = require('express-session')
var randomstring = require('randomstring')

var iieat = require('./apps/iieat')
var gentleman = require('./apps/gentleman')

var app = express()

app.VisitCnt = 0
console.log(app.get('env'))
switch (app.get('env')) {
  case 'development':
    //app.user();
    app.use(function (req, res, next) {
      res.locals.showTests = req.query.test === '1'
      next()
    })
    break
  case 'production':
    //app.use();
    break
}
// app.engine('handlebars', handlebars.engine);
// app.set('view engine', 'handlebars');

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')
app.locals.basedir = app.get('views')
app.disable('x-powered-by')
console.log(`http://${global.config.host}:${global.config.socketPort}`)

app.use(require('body-parser')())
app.use(cookieParser())
app.use(helmet())
app.use(
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com', 'ajax.googleapis.com'],
      scriptSrcAttr: ["'unsafe-inline'"],
      objectSrc: ["'none'"],
      connectSrc: [`ws://${global.config.socket}`, `http://${global.config.socket}`, "'self'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  })
)
app.use(
  session({
    secret: SEC.secret || 'develop',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      domain: '',
    },
  })
)

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization')
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS')
  next()
})

app.use(function (req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1'
  next()
})

app.use(express.static(__dirname + '/public'))

app.use(/\/(photoLoader){0,2}/, (req, res, next) => {
  if (req.session.visit) {
    req.session.visit += 1
  } else {
    req.session.visit = 1
    app.VisitCnt += 1
  }
  next()
})

const corsOptions = {
  origin: `https://${global.config.host}:${global.config.socketPort}`,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))

var apiLoader = require('./api/apiLoader')
apiLoader(app)

app.get('/', function (req, res) {
  res.render('home', {
    visit: req.session.visit,
    VisitCnt: app.VisitCnt,
    socket: config.socket,
  })
})

app.use('/iieat', iieat.app)
// app.get('/iieatv2', (req, res) => {
//     res.sendFile(__dirname+'/public/views/iieatv2.html');
// });

// app.post('/iieatv2', (req, res) => {
//     res.sendFile(__dirname+'/public/views/iieatv2.html');
// });

app.use('/', gentleman.app)

app.use(function (req, res) {
  console.log(`404!!${req.url}`)
  res.status(404)
  res.send('404')
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500)
  res.send('Something go wrong QAQ')
})

app.set('port', process.env.PORT || config.port)
function startServer() {
  app.listen(config.port, config.host, () => {
    console.log(`Expreeso started on http://${config.host}:${config.port}`)
  })
}

if (require.main === module) {
  startServer()
} else {
  module.exports = startServer
}
