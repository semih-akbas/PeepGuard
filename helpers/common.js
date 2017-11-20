var fs          = require("fs");
var isPi        = require('detect-rpi');
var moment      = require('moment');
var os          = require('os');
var cpuStat = require('cpu-stat');

var logCurrentCPUTemperature = function (maxLogCount, socket) {
    var time = moment().format('YYYY-MM-DD hh:mm:ss');
    var logPath = __dirname + "/../cpuTempLog.txt";
    var temperature = readCPUTemperature();
    
    var array = [];
    if(fs.existsSync(logPath))
    {
        array = fs.readFileSync(logPath).toString().split('\r\n');
    }

    var dataArr = [time, parseFloat(temperature)];   
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
    fs.writeFileSync(logPath, fileContent);  
    socket.emit('refresh-temperature',temperature, dataArr);
    
    var memoryPercentage = ((os.freemem() / os.totalmem())*100).toFixed(0);
    socket.emit("refresh-memory", memoryPercentage);
    
    cpuStat.usagePercent({
        coreIndex: -1,
        sampleMs: 2000,
    },
    function(err, percent, seconds) {
        socket.emit("refresh-cpu", percent.toFixed(0))
    });  
    
    return array.length;            
}

var readCPUTemperature = function () {
    if(!isPi()){
        temperature = (Math.random() * 100).toFixed(2);
    }
    else{
        temperature = parseFloat(fs.readFileSync("/sys/class/thermal/thermal_zone0/temp")).toFixed(2) / 1000;
    }
    
    return temperature;            
}

module.exports.readCPUTemperature = readCPUTemperature;
module.exports.logCurrentCPUTemperature = logCurrentCPUTemperature;
