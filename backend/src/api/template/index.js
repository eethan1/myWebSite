var http = require('http');
var xss = require('xss');
var router = require('express').Router();
var models = require('./model')

var Msg = models.Msg;

router.route('')
    .get()
    .post()
    .put()
    .delete()

module.exports = {
    api: router
}