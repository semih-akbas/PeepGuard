var fs          = require("fs");
var isPi        = require('detect-rpi');
var moment      = require('moment');

var logCurrentCPUTemperature = function (maxLogCount, socket) {
    var time = moment().format('YYYY-MM-DD hh:mm:ss');
    var logPath = __dirname + "/../cpuTempLog.txt";
    var temperature = readCPUTemperature();
    socket.emit('refresh-temperature',temperature);

    var array = [];
    if(fs.existsSync(logPath))
    {
        array = fs.readFileSync(logPath).toString().split('\r\n');
    }

    var data = "['" + time + "', " + temperature + "], "
    var newLength = array.push(data);
    //remove oldest item if there are more than {maxLogCount} logs
    if(newLength > maxLogCount){
        array = array.shift();
    }
    var fileContent = '';
    for(i = 0; i < array.length; i++){
        fileContent = fileContent + array[i] + "\r\n";
    }
    console.log("CPU Temp: " + temperature + " °C");
    fs.writeFileSync(logPath, fileContent);  

    return array.length;            
}

var readCPUTemperature = function () {
    if(!isPi()){
        temperature = Math.random() * 100;
    }
    else{
        temperature = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp") / 1000;
    }
    
    return temperature;            
}

module.exports.readCPUTemperature = readCPUTemperature;
module.exports.logCurrentCPUTemperature = logCurrentCPUTemperature;
