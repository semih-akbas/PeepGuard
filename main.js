var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var fs          = require('fs');
var path        = require('path');
var spawn       = require('child_process').spawn;
var hbs         = require('express-handlebars');

//TODO:Add GPIO package for Raspberry PI
//var gpio = require('rpi-gpio');

//app.set('views', (__dirname + '/../views'));
app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Routes
var diagnosticsRouter = require('./routes/diagnostics');

var proc;
app.use(function timeLog (req, res, next) {
    console.log('Request time: ', Date.now());
    next();
});


/*
app.use('/', express.static(path.join(__dirname, 'stream')));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
*/
app.use('/diagnostics', diagnosticsRouter);


var sockets = {};
io.on('connection', function (socket) {
    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);
    socket.on('disconnect', function () {
        delete sockets[socket.id];
        // no more sockets, kill the stream
        if (Object.keys(sockets).length == 0) {
            app.set('watchingFile', false);
            if (proc) proc.kill();
            fs.unwatchFile('./stream/image_stream.jpg');
        }
    });
    socket.on('start-stream', function () {
        startStreaming(io);
    });
});
http.listen(3000, function () {
    console.log('listening on *:3000');
});
function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
    }
}
function startStreaming(io) {
    if (app.get('watchingFile')) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        return;
    }
    var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
    proc = spawn('raspistill', args);
    console.log('Watching for changes...');
    app.set('watchingFile', true);
    fs.watchFile('./stream/image_stream.jpg', function (current, previous) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    })
}