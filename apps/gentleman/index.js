var router = require('express').Router();
var risUtil = require('./utils/risuRetriever');
var avv8 = require('./utils/91avv8Retriever');
var c5278 = require('./utils/5278Retriever');
router.get('/risu', (req, res) => {
    res.render('Retriever/risu');
});
router.post('/risu', (req, res) => {
    var hash = req.body.hash;
    var password = req.body.password;
    risUtil.getFileUrl(hash, password).then( (pos) => {
        if(pos == 'Failed'){
            res.send('Wrong password');
        }else{
            res.send(`<a href=${pos} rel=noreferrer>Be a Gentleman</a>`);
        }
    })
});

router.get('/91avv8', (req, res) => {
    res.render('Retriever/91avv8');
});
router.post('/91avv8', (req, res) => {
    var index = req.body.index;
    avv8.getFileUrl(index).then( (pos) => {
        if(pos == 'Failed'){
            res.send('Failed');
        }else{
            res.send(`<a href=${pos} rel=noreferrer>Be a Gentleman</a>`);
        }
    })
});
router.get('/5278', (req, res) => {
    res.render('Retriever/5278');
});
router.post('/5278', (req, res) => {
    var index = req.body.index;
    c5278.getFileStream(index).then( (s) => {
        if(s == 'Failed'){
            res.send('Failed');
        }else{
            res.setHeader('content-disposition',`attachment; filename=${index}.ts`);
            res.setHeader("content-type","video/MP2T");
            s.pipe(res);
        }
    })
});


module.exports = {
    app: router
}