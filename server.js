var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/assets', express.static(__dirname + '/public/assets'));
app.use('/fonts', express.static(__dirname + '/public/fonts'));
app.use('/sound', express.static(__dirname + '/public/sound'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

server.listen(process.env.PORT || 8081, function () {
    console.log('Listening on ' + server.address().port);
});

server.lastPlayerID = 0;
server.exitCount = 0;

io.on('connection', function (socket) {

    // initialisation d'un nouveau joueur
    socket.on('newplayer', function () {
        if (server.lastPlayerID > 1) return;

        socket.player = {
            id: server.lastPlayerID++,
            ready: false
        };
        socket.emit('selfplayer', {self: socket.player, others: getAllPlayers()});
        socket.broadcast.emit('otherplayer',  socket.player);
        console.log('New player connected !');       
    });

    // action "ready" d'un player
    socket.on('playerready', function() {
        socket.player.ready = true;
        socket.broadcast.emit('playerready', socket.player);
        if (getPlayersReady().length === 2) {
            socket.emit('startgame');
            socket.broadcast.emit('startgame');
        }
    });

    // Interrupteur actif 
    socket.on('opendoor', function(color) {
        socket.broadcast.emit('opendoor', color);
    });

    // Interrupteur inactif 
    socket.on('closedoor', function(color) {
        socket.broadcast.emit('closedoor', color);
    });

    // player on exit spot
    socket.on('inexit', function() {
        server.exitCount++;
        if(server.exitCount === 2) {
            socket.emit('success');
            socket.broadcast.emit('success');
        }

    });

    // player out of exit spot
    socket.on('outexit', function(){
        server.exitCount--;
    });

    //disconnect
    socket.on('disconnect', function () {
        if(socket.player)
            io.emit('remove', socket.player.id);
    });

});

function getAllPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}

function getPlayersReady() {
    var playersReady = [];
    for (const socketID of Object.keys(io.sockets.connected)) {
        var player = io.sockets.connected[socketID].player;
        if (player && player.ready) {
            playersReady.push(player);
        }
    }
    return playersReady;
}