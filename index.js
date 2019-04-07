var express = require('express');
var handlebars = require('express3-handlebars').create({ defaultLayout:'main'});
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http');
const SEC = require('./SEC');
const ARG = require('./ARG');
var session = require('express-session');
const server = http.Server(app);
const io = require('socket.io')(server);
var Msg = require('./db').Msg;
var randomstring = require('randomstring');

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

// app.use(function(req, res, next){
// 	var cluster = require('cluster');
// 	if(cluster.isWorker) console.log('Worker %d received requset ', cluster.worker.id);
// 	next();
// });

app.use(require('body-parser')());
app.use(cookieParser());

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
        console.log(data);
        res.send('success');
        io.emit("message", {msg:req.body.msg, id:data._id});
        return true;
    });
});

app.delete('/msg', function(req, res){
    Msg.remove({_id:req.body._id, sid:req.sessionID}, (err, data) => {
        if(err){
            res.json({code:403});
            return console.log(err);
        }
        res.json({code:200});
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
    if(req.session.visit){
        req.session.visit += 1;
    }else{
        req.session.visit = 1;
        app.VisitCnt += 1;
    }
    console.log(req.session.visit);
    console.log(req.sessionID);
    res.render('home',{
        visit: req.session.visit,
        VisitCnt:app.VisitCnt,
        socket: ARG.socket
    });
});

app.use(function(req, res) {
	console.log(req.url);
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
	app.listen(ARG.port, () => {
        console.log( `Expreeso started on http://${ARG.host}:${ARG.port}`);
    });
	// http.createServer(app).listen(app.get('port'), function(){
	// 	console.log( 'Express started in' + app.get('env') +
	// 		'mode on http://: ' + app.get('port') +
	// 		'; press Ctrl-C to terminate.');
	// })
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