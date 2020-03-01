var xss = require('xss');
var express = require('express');
var router = require('express').Router();

// app.use(express.static(__dirname+'/public'))
router.use(express.static(__dirname+'/public'));
router.use('/', express.static(__dirname+'/public'));

module.exports = {
    app: router
}