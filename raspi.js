var app       =     require("express")();
var http      =     require('http').Server(app);
var io        =     require("socket.io")(http);
var fs        =     require("fs");
var isPi = require('detect-rpi');

var currentTemperature = 0.0;

app.get("/",function(req,res){
    res.sendFile(__dirname + '/raspi.html');
});

/*  This is auto initiated event when Client connects to Your Machien.  */

io.on('connection',function(socket){  
    console.log("A user is connected");
    socket.on('status added',function(temperature){
        update_temperature(function(currentTemperature){
        if(currentTemperature){
            io.emit('refresh feed',currentTemperature);
        } else {
            io.emit('error');
        }
      });
    });
});

var update_temperature = function (callback) {
    if(!isPi()){
        temperature = Math.random() * 100;
        callback(temperature);
    }
    else{
        temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp") / 1000;
        console.log("Current CPU Temperature: " + temperature);
    }
    
    return;
}

http.listen(3000,function(){
    update_temperature(function(currentTemperature){});
    console.log("Listening on 3000");
});