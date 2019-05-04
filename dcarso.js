var fs = require('fs');
var sharp = require('sharp');
var multer = require('multer');
var ipInforModel = require('./dcarsodb').IPInforModel;
const requestIP = require('request-ip');
const readChunk = require('read-chunk');
const imageType = require('image-type');
const fileType = require('file-type');
var randomString = require('randomstring');

const ARG = require('./ARG');
const REQLIMIT = ARG.ipLimitTimes;
const INTERVAL = ARG.ipLimitInterval;
const UPLOADPOSITION = ARG.uploadPosition;

const imgFilter = function(name) {
    const expr = /^.+\.(jpeg|png|jpg)$/;
    if(name.match(/(\..*|\/.*){2,}/)){
        console.log(`\n############\ninvalid request filename ${name}\n############\n`);
        console.log(name.match(/(\..*|\/.*){2,}/) );
         return false;
    }
    return name.match(expr);
};

var async = require('async');

var dbQ = async.queue((task, finish)=>{
    task.run();
    finish(null);
},1);

const upload = multer({
    dest:UPLOADPOSITION,
    storage: multer.memoryStorage(),
    limits:{
        fileSize:5*1024*1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (imgFilter(file.originalname)){
            return cb(null, true);
        }
        return cb(new Error(`Invalid extension ${file.originalname}`));
    }
}).single('logo');
// var reqLimiter = new RateLimit({
//     windowMs:INTERVAL,
//     max:TIMES,
//     delayMs:0,

// });

var dcarsoMiddleware = function(app){
    app.use((req, res, next) => {
        const customIP = requestIP.getClientIp(req);
        var now = Date.now();
        var nowHours = ~~(now/INTERVAL);
        res.header('X-RateLimit-Reset', nowHours+1);        
        
        var task = {
            name:customIP,
            run: ()=>{
                ipInforModel.findOrCreateByIP(customIP, now)
                .then((ipInfor)=>{
                    if(ipInfor.count > REQLIMIT) {
                        res.status(429);
                        res.send('Too Many Request');
                    } else {
                        next();
                    }
                }).catch((err)=>{
                    if(err) console.log(err);
                });
            },
            callback: (err) => {
                if(err){
                    console.log(err);
                    throw err;
                }
            }
        }
        dbQ.push(task, task.callback);
    });
}

var dcarso = function(app){
    app.post('/api/img',  (req, res) => {
            upload(req, res, err => {
            res.status(406);
            if(err) return res.send({status:406, 'msg':err.message});
            var file = req.file;
            let buffer = file.buffer;
            const ft = fileType(buffer);
            if(ft ===null || (ft.ext !=="jpg" && ft.ext !== "png")) return res.send({status:406, msg:'Invalid filetype', filetype:ft});
            // file.path = __dirname + '/upload/' + randomString.generate(32) + '.' + ft.ext;
            file.name = randomString.generate(32) + '.' + ft.ext
            file.path = UPLOADPOSITION + file.name;
            fs.writeFile(file.path, new Buffer.from(buffer), err=>{if(err) console.log(err);});
            res.type('application/json');
            res.status(200);
            return res.send({status:200, filepath:file.name, type:file.mimetype});
        });
    });


    app.get('/api/img/:imgid', (req, res, next)=>{
        var w = Number(req.query.w);
        var h = Number(req.query.h);
        // console.log(req.params.imgid.match(imgFilter));
        if(!imgFilter(req.params.imgid)) {
            res.status(403);
            return res.send('Invalid request resource!');
        }
        var imgPath = UPLOADPOSITION+req.params.imgid;
        // console.log(imgPath);
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