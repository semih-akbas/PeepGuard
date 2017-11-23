var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var path        = require('path');
var exphbs      = require('express-handlebars');
var io          = require('socket.io')(http);
var common      = require('./helpers/common');
var cors 		= require('cors')

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

app.use(cors());
app.engine('html', hbs.engine);
app.set('view engine', 'html');
app.use(function timeLog (req, res, next) {
	console.log('Request time: ', Date.now());
    next();
});
app.use('/diagnostics', diagnosticsRouter);

http.listen(3000, function () {
    console.log('listening on *:3000');
});
