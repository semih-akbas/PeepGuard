var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var path        = require('path');
var exphbs      = require('express-handlebars');
var io          = require('socket.io')(http);
var common      = require('./helpers/common');

//Start CPU Temp Logging
var cpuTempLogInterval = 1000;
setInterval(function(){
    common.logCurrentCPUTemperature(400, io);
}, cpuTempLogInterval);

//TODO:Add GPIO package for Raspberry PI
//var gpio = require('rpi-gpio');
io.on('connection',function(socket){  
	console.log("A user is connected on main.js");
});

//Express Routers
var diagnosticsRouter = require('./routes/diagnostics')(io);
var hbs = exphbs.create({
	defaultLayout: "main",
	extname: "html",
	helpers: {
		section: function (name, options) {
			if (!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});



app.engine('html', hbs.engine);
app.set('view engine', 'html');
app.use(function timeLog (req, res, next) {
	console.log('Request time: ', Date.now());
	var allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://sammyhg.ddns.net:3000'];
	var origin = req.headers.origin;
	console.log(origin);
	if(allowedOrigins.indexOf(origin) > -1){
		 res.setHeader('Access-Control-Allow-Origin', origin);
	}
	res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.header('Access-Control-Allow-Credentials', true);
    next();
});
app.use('/diagnostics', diagnosticsRouter);

http.listen(3000, function () {
    console.log('listening on *:3000');
});
