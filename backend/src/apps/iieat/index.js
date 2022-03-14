var xss = require('xss');
var router = require('express').Router();

router.get('/', (req, res) => {
    res.render('iieat');
})

router.get('/add', (req, res) => {
    if(req.cookies['ii?'] === '7122')
        res.render('iieatadd');
    else
        res.sendStatus(403);
});


module.exports = {
    app: router
}