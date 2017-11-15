var app       =     require("express")();
var http      =     require('http').Server(app);
var io        =     require("socket.io")(http);
var fs        =     require("fs");
var isPi = require('detect-rpi');

var currentTemperature = 0.0;

app.get("/",function(req,res){
    res.sendFile(__dirname + '/raspi.html');
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

http.listen(3000,function(){
    setTimeout(UpdateTemperature, 10000, function(currentTemperature){});    
    //UpdateTemperature(function(currentTemperature){});
    console.log("Listening on 3000");
});