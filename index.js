var express = require('express');
var handlebars = require('express-handlebars').create({ defaultLayout:'main'});
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var xss = require('xss');
var http = require('http');
var session = require('express-session');
var randomstring = require('randomstring');

var dcarso = require('./dcarso');

// You should use your SEC.js. See SEC-default.js
const SEC = require('./SEC');
// You should use your ARG.js. See ARG-default.js
const ARG = require('./ARG');
var Msg = require('./db').Msg;

var app = express();
const server = http.Server(app);
const io = require('socket.io')(server);


app.VisitCnt = 0;
console.log(app.get('env'));
switch(app.get('env')){
	case 'development':
		//app.user();
		app.use(function(req, res, next){
			res.locals.showTests = req.query.test === '1';
			next();
		})
		break;
	case 'production':
		//app.use();
		break;
}
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.disable('x-powered-by');

dcarso.middleware(app);

app.use(require('body-parser')());
app.use(cookieParser());
app.use(helmet());

app.use(session({
    secret: SEC.secret || "develop",
    saveUninitialized: false,
    cookie: {
        maxAge: 30*60*1000,
        httpOnly:true,
        domain:'',
    }
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
    next();
});

app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' &&
		req.query.test === '1';
	next();
});

app.use(express.static(__dirname + '/public'));

app.use(/\/(photoLoader){0,2}/, (req, res, next) => {
    console.log(req.headers['referer']+'#################################'+req.host);
    if(req.session.visit){
        req.session.visit += 1;
    }else{
        req.session.visit = 1;
        app.VisitCnt += 1;
    }
    next();
});

app.post('/msg', function(req, res){
    var newMsg = new Msg({
        time:Date(),
        sid:req.cookies['connect.sid'].substring(2,34),
        msg:req.body.msg
    });
    newMsg.save((err, data)=>{
        if(err) {
            console.log(err);
            res.send('fail');
            return false;
        }
        console.log(req.body.msg, xss(req.body.msg));
        res.send('success');
        io.emit("message", {msg:xss(req.body.msg), id:data._id});
        return true;
    });
});

app.delete('/msg', function(req, res){
    Msg.deleteOne({_id:req.body._id, sid:req.sessionID}, (err, data) => {
        console.log(req.body._id);
        // console.log(data);
        console.log(req.sessionID);
        console.log(data.deletedCount)
        if(err||data.deletedCount !== 1){
            res.json({code:403});
            return console.log(err);
        }
        res.json({code:200});
        io.emit('delMsg', {id:req.body._id});
        return false;
    })
});

app.get('/msg', function(req, res){
    Msg.find().exec((err, data) => {
        if(err) {
            console.log(err);
            res.send('fail');
            return false;
        }
        for(i=0;i < data.length;++i){
            if(data[i].sid !== req.sessionID) {
                data[i].sid = false;
            }else{
                data[i].sid = true;
            }
        }
        res.send(data);
        return true;
    });
});
app.get('/', function(req, res){
    res.render('home',{
        visit: req.session.visit,
        VisitCnt:app.VisitCnt,
        socket: ARG.socket
    });
});

dcarso.addApp(app);

app.use(function(req, res) {
	console.log(`404!!${req.url}`);
	res.status(404);
    res.send('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.send('Something go wrong QAQ');
});

app.set('port', process.env.PORT || ARG.port);
function startServer() {
	app.listen(ARG.port, ARG.host,() => {
        console.log( `Expreeso started on http://${ARG.host}:${ARG.port}`);
    });
}

if(require.main === module) {
	startServer();
}else{
	module.exports = startServer;
}

io.on('connection', (socket) =>{
    console.log('connected');
    socket.on("disconnect", ()=>{
        console.log('disconnected');
    });
});

server.listen(ARG.socketPort);