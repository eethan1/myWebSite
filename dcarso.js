var fs = require('fs');
var sharp = require('sharp');
var multer = require('multer');
// var RateLimit = require('express-rate-limit');
var upload = multer({dest:'upload/'});
var ipInforModel = require('./dcarsodb').IPInforModel;
const ARG = require('./ARG');
const requestIP = require('request-ip');
const readChunk = require('read-chunk');
const imageType = require('image-type');
var randomString = require('randomstring');
const INTERVAL = ARG.ipLimitInterval;
const REQLIMIT = ARG.ipLimitTimes;

// var reqLimiter = new RateLimit({
//     windowMs:INTERVAL,
//     max:TIMES,
//     delayMs:0,

// });

var dcarsoMiddleware = function(app){
    app.use((req, res, next) => {
        const customIP = requestIP.getClientIp(req);
        console.log(req.url);
        var now = Date.now();
        var nowHours = ~~(now/INTERVAL);
        res.header('X-RateLimit-Reset', nowHours+1);
        var lastReqHours = 1;
        ipInforModel.findOrCreateByIP(customIP).then(ipInfor=>{
            console.log('Find: ');
            console.log(ipInfor);
            lastReqHours = ~~(ipInfor.lastReqTime/INTERVAL);
            console.log(nowHours - lastReqHours);
            ipInfor.count = ((nowHours - lastReqHours)==0)*ipInfor.count + 1;
            ipInfor.lastReqTime = now;
            return Promise.resolve(ipInfor);
        })
        .then(ipInfor=>{return ipInforModel.update(ipInfor);})
        .then(ipInfor=>{
            res.header('X-RateLimit-Remaining',(REQLIMIT-ipInfor.count >=0?REQLIMIT-ipInfor.count:0));
            if(ipInfor.count > REQLIMIT) {
                res.status(429);
                res.send('Too Many Requests!');
                return false;
            } else {
                return next();
            }
        })
        .catch(error=>{
            console.log(error);
        });
    });
}

var dcarso = function(app){
    app.post('/api/upload', upload.single('logo'), (req, res, next) => {
        var file = req.file;
        console.log(`filename: ${file.originalname}`);
        console.log(`filepath: ${file.path}`);
        res.send({status:200, filepath:file.path});
    });
    app.get('/api/img/:imgid', (req, res, next)=>{
        var w = Number(req.query.w);
        var h = Number(req.query.h);
        var imgPath = __dirname+'/upload/'+req.params.imgid;
        console.log(imgPath);
        var returnImg = imgPath;
        fs.exists(imgPath, (exists) => {
            if(exists) {
                const buffer = readChunk.sync(imgPath, 0, 12);
                var imgtype = imageType(buffer);
                res.type(imgtype.mime);
                const readStream = fs.createReadStream(imgPath);
                let transform = sharp();
                if(w && h) {
                    transform = transform.resize(w, h);
                }
                return readStream.pipe(transform).pipe(res);
            }else{
                return next();
            }
        });
    });
    app.get('/photoUploader', (req, res, next) => {
        res.render('photoUploader', {
            visit: req.session.visit,
            VisitCnt:app.VisitCnt,
            socket: ARG.socket
        });
    });
} 


module.exports = {
    addApp: dcarso,
    middleware: dcarsoMiddleware
}