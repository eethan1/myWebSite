var models = require('./model')
var http = require('http');
var xss = require('xss');

var Msg = models.Msg;

var addMsgApi = function(app) {
    var ioServer = http.Server(app);
    var io = require('socket.io')(ioServer);
    io.on('connection', (socket) =>{
        console.log('connected');
        socket.on("disconnect", ()=>{
            console.log('disconnected');
        });
    });
    ioServer.listen(global.config.socketPort);

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
            res.send('success');
            io.emit("message", {msg:xss(req.body.msg), id:data._id});
            return true;
        });
    });

    app.delete('/msg', function(req, res){
        Msg.deleteOne({_id:req.body._id, sid:req.sessionID}, (err, data) => {
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
    return app;
}

module.exports = {
    addApi: addMsgApi
}