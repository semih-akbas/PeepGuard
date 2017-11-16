var express     =   require("express");
var path        =   require("path");
var http        =   require('http').Server(express);
var io          =   require("socket.io")(http);
var fs          =   require("fs");
var isPi        =   require('detect-rpi');

var router      =   express.Router();
router.get('/', function(req, res) {   
    
    //setTimeout(UpdateTemperature, 2000, function(nil){});
    res.render('main', {deneme: 'hebele', points: '0,80 20,60 40,80 60,20'});
    
});

io.on('connection',function(socket){  
    console.log("A user is connected");
    /*socket.on('refresh-temperature',function(temperature){
        UpdateTemperature(function(currentTemperature){
        if(currentTemperature){
            io.emit('refresh feed',currentTemperature);
        } else {
            io.emit('error');
        }
        });
    });*/
});

var UpdateTemperature = function () {
    if(!isPi()){
        temperature = Math.random() * 100;
    }
    else{
        temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp") / 1000;
        fs.appendFileSync(__dirname + "/temperatureLog.txt", temperature + "\r\n");
    }

    console.log("Current CPU Temperature: " + temperature + " °C");
    //setTimeout(UpdateTemperature, 2000, function(temperature){});           

    io.emit('refresh-temperature',temperature);

    return;
}

module.exports = router
