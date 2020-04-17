const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
 
var players = {};
var bullets = {};
var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};
var ball = {};
var scores = {
  blue: 0,
  red: 0
};

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/Game.html');
});
app.get('/index.html', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});
app.get('/game.js', function (req, res) {
    res.sendFile(__dirname + '/game.js');
});
app.get('/index.js', function (req, res) {
    res.sendFile(__dirname + '/index.js');
});
app.get('/phaser.min.js', function (req, res) {
    res.sendFile(__dirname + '/phaser.min.js');
});
app.get('/socket.io/socket.io.js', function (req, res) {
    res.sendFile(__dirname + '/socket.io/socket.io.js');
});
app.get('/Assets/Player.png', function (req, res){
    res.sendFile(__dirname + '/Assets/Player.png');
});
app.get('/Assets/otherPlayer.png', function (req, res){
  res.sendFile(__dirname + '/Assets/otherPlayer.png');
});
app.get('/Assets/Star.png', function (req, res){
  res.sendFile(__dirname + '/Assets/Star.png');
});
app.get('/Assets/Bullet.png', function (req, res){
  res.sendFile(__dirname + '/Assets/Bullet.png');
});
app.get('/Assets/Ball.png', function (req, res){
  res.sendFile(__dirname + '/Assets/Ball.png');
});
app.get('/Assets/collect_coin_03.wav', function (req, res){
  res.sendFile(__dirname + '/Assets/collect_coin_03.wav');
});
app.get('/Assets/collect_item_17.wav', function (req, res){
  res.sendFile(__dirname + '/Assets/collect_item_17.wav');
});
app.get('/Assets/music.wav', function (req, res){
  res.sendFile(__dirname + '/Assets/music.wav');
});


io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };
  bullets[socket.id] = {
    rotation: players[socket.id].rotation,
    x: players[socket.id].x,
    y: players[socket.id].y,
    bulletId: players[socket.id].playerId
  };
  ball[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    ballId: socket.id
  }
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // send the star object to the new player
  socket.emit('starLocation', star);
  // send the ball object to the new player
  socket.emit('ballLocation', ball);
  // send the current scores
  socket.emit('scoreUpdate', scores);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  socket.emit('currentBullets', bullets);
 
  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
  // when the ball moves, update the players data
  socket.on('ballMovement', function (movementData) {
    ball[socket.id].x = movementData.x;
    ball[socket.id].y = movementData.y;
    ball[socket.id].rotation = movementData.rotation;
    socket.broadcast.emit('ballMoved', ball[socket.id]);
  })
  socket.on('starCollected', function () {
    if (players[socket.id].team === 'red') {
      scores.red += 10;
    } else {
      scores.blue += 10;
    }
    star.x = Math.floor(Math.random() * 700) + 50;
    star.y = Math.floor(Math.random() * 500) + 50;
    io.emit('starLocation', star);
    io.emit('scoreUpdate', scores);
  });
  socket.on('ballCollided', function(){
    if (players[socket.id].team === 'red') {
      scores.red -= 5;
    } else {
      scores.blue -= 5;
    }
    ball.x = Math.floor(Math.random() * 700) + 50;
    ball.y = Math.floor(Math.random() * 700) + 50;
    io.emit('ballLocation', ball);
    io.emit('scoreUpdate', scores);
  });
});
 
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});