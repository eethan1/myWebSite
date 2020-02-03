var http=require('http');
var spawn = require('child_process').spawn;
var createHandler = require('github-webhook-handler');

var handler = createHandler({ path:'/myWebSite',secret:'test&test'});
http.createServer(function(req, res) {
    handler(req, res, function(err) {
        res.statusCode = 404;
        res.end('not found');
    });
}).listen(6666);


handler.on('push', function(event) {
    console.log(`Push Event ${event.payload.repository.name} & ${event.payload.ref}`);
    runCommand('echo',['jizzz'], function(txt) {

        console.log(txt);
    });
});

function runCommand(cmd,args, cb) {
    var child = spawn(cmd,args);
    var resp = '';
    child.stdout.on('data', function(buf) {
        resp += buf.toString();
    });
    child.stdout.on('end', function(){
        cb(resp);
    })
}