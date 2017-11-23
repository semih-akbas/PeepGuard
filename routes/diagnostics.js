var express     = require("express");
var path        = require("path");
var fs          = require("fs");
var isPi        = require('detect-rpi');
var moment      = require('moment');

var router = express.Router();
var socket = null;
var logPath = __dirname + "/../cpuTempLog.txt";

//BASE_URL/diagnostics
router.get('/', function(req, res) {   
    res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
    io = req.app.io;
    temperatureData = fs.readFileSync(logPath);
    res.render('layouts/main', {deneme: 'hebele', temperature_data: temperatureData});
});

module.exports = function(io){
    var express = require("express");
    socket = io;
    return router;
}