var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var path        = require('path');
var exphbs         = require('express-handlebars');

//TODO:Add GPIO package for Raspberry PI
//var gpio = require('rpi-gpio');

//Routers
var diagnosticsRouter = require('./routes/diagnostics');

var hbs = exphbs.create({
	defaultLayout: "home",
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
    next();
});

app.use('/diagnostics', diagnosticsRouter);

http.listen(3000, function () {
    console.log('listening on *:3000');
});
