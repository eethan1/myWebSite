var http = require('http');
var xss = require('xss');
var router = require('express').Router();
var models = require('./model')

router.use((req,res,next) => {
    console.log(`url: `);
    console.log(req.url)
    console.log(`body: `);
    console.log(req.body);
    console.log(`query: `);
    console.log(req.query);
    console.log(`params: `);
    console.log(req.params);
    next();
});

router.route('/echo')
    .get((req, res) => {
        res.send(`url: ${req.url}<br>query: ${req.query}`);
    })
    .post((req, res) => {
        res.send(`url: ${req.url}<br>body: ${req.body}<br>query: ${req.query}`);
    })
    // .put()
    // .delete()
    
module.exports = {
    api: router
}