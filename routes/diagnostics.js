var express     =   require("express");
var path        =   require("path");
var http        =   require('http').Server(express);
var io          =   require("socket.io")(http);
var fs          =   require("fs");
var isPi        =   require('detect-rpi');
var hbs         =   require('express-handlebars');

//var chartKick   =   require("chartkick");
var app = express();
var router = express.Router();
var currentTemperature = 0.0;

router.get('/', function(req, res) {
    console.log("HERE!!! " + __dirname);
    
    setTimeout(UpdateTemperature, 10000, function(currentTemperature){});
    //res.sendFile(path.resolve('pages/diagnostics.html'));
    //res.render(path.resolve('pages/diagnostics.html'))
    res.render('home', {deneme: 'hebele'});
    
});

io.on('connection',function(socket){  
    console.log("A user is connected");
    socket.on('status added',function(temperature){
        UpdateTemperature(function(currentTemperature){
        if(currentTemperature){
            io.emit('refresh feed',currentTemperature);
        } else {
            io.emit('error');
        }
      });
    });
});

var UpdateTemperature = function (callback) {
    if(!isPi()){
        temperature = Math.random() * 100;
    }
    else{
        temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp") / 1000;
        fs.appendFileSync(__dirname + "/temperatureLog.txt", temperature + "\r\n");
    }

    console.log("Current CPU Temperature: " + temperature + " °C");
    callback(temperature);    
    setTimeout(UpdateTemperature, 10000, function(temperature){});           

    io.emit('refresh feed',temperature);

    return;
}

module.exports = router
