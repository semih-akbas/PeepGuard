var express     = require("express");
var path        = require("path");
var fs          = require("fs");
var isPi        = require('detect-rpi');
var moment      = require('moment');

var router = express.Router();
var socket = null;
var interval = 5000;

router.get('/', function(req, res) {   
    io = req.app.io;
    UpdateTemperature();
    temperatureData = fs.readFileSync(__dirname + "/temperatureLog.txt");
    res.render('layouts/main', {deneme: 'hebele', temperature_data: temperatureData});
});

var UpdateTemperature = function () {
    var time = moment().format('YYYYmmDDhhmm');

    if(!isPi()){
        temperature = Math.random() * 100;
    }
    else{
        temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp") / 1000;
    }
    
    var data = "['" + time + "', " + temperature + "], "

    console.log("Current CPU Temperature: " + temperature + " °C");
    //console.log("Data: " + data);
    fs.appendFileSync(__dirname + "/temperatureLog.txt", data + "\r\n");    

    socket.emit('refresh-temperature',temperature);
    setTimeout(UpdateTemperature, interval, function(temperature){});               
}
module.exports = function(io){
    var express = require("express");
    socket = io;
    return router;
}