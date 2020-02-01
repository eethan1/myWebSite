var router = require('express').Router();
var risUtil = require('./utils/risuRetriever');
router.get('/', (req, res) => {
    res.render('risuDownloader');
});
router.post('/', (req, res) => {
    var hash = req.body.hash;
    var password = req.body.password;
    risUtil.getFileUrl(hash, password).then( (pos) => {
        if(pos == 'Failed'){
            res.send('Wrong password');
        }else{
            res.send(`<a href=${pos}>Be a Gentleman</a>`);
        }
    })
});

module.exports = {
    app: router
}