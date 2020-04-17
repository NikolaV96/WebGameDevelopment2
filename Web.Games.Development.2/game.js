var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
   
  var game = new Phaser.Game(config);
   
  function preload() {
    this.load.image('player','Assets/Player.png')
    this.load.image('otherPlayer', 'Assets/otherPlayer.png')
    this.load.image('star','Assets/Star.png')
    this.load.image('bullet', 'Assets/Bullet.png')
    this.load.image('ball', 'Assets/Ball.png')

    this.load.audio('collectStar', ['Assets/collect_coin_03.wav'])
    this.load.audio('ballHit', ['Assets/collect_item_17.wav'])
    this.load.audio('music', ['Assets/music.wav'])
  }
   
  function create() {
    var self = this;
    this.collectStarSound = this.sound.add('collectStar');
    this.ballHitSound = this.sound.add('ballHit');
    this.music = this.sound.add('music');
    
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.socket.on('currentPlayers', function(players){
      Object.keys(players).forEach(function(id){
        if(players[id].playerId === self.socket.id){
          addPlayer(self, players[id]);
        } else {
          addOtherPlayers(self, players[id]);
        }
      });
    });
    /*this.socket.on('currentBullets', function(bullets){
      Object.keys(bullets).forEach(function(id){
          if(bullets[id].bulletId === self.socket.id){
            addPlayerBullet(self, bullets[id]);
          }
      });
    });*/
    
    this.socket.on('newPlayer', function (playerInfo) {
      addOtherPlayers(self, playerInfo);
    });
    this.socket.on('disconnect', function (playerId) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    this.socket.on('playerMoved', function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });
    this.socket.on('ballMoved', function (ballInfo) {
      if (ballInfo.ballId === otherBall.playerId) {
        otherBall.setRotation(ballInfo.rotation);
        otherBall.setPosition(ballInfo.x, ballInfo.y);
      }
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
    this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });
      
    this.socket.on('scoreUpdate', function (scores) {
      self.blueScoreText.setText('Blue: ' + scores.blue);
      self.redScoreText.setText('Red: ' + scores.red);
    });
    this.socket.on('starLocation', function (starLocation) {
      if (self.star) self.star.destroy();
      self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
      self.physics.add.overlap(self.ship, self.star, function () {
        this.collectStarSound.play();
        this.socket.emit('starCollected');
      }, null, self);
    });
    this.socket.on('ballLocation', function (ballLocation){
      if (self.ball) self.ball.destroy();
      self.ball = self.physics.add.image(ballLocation.x, ballLocation.y, 'ball');
      self.physics.add.overlap(self.ship, self.ball, function (){
        this.socket.emit('ballCollided');
        this.ballHitSound.play();
      }, null, self);
    });
    if (!this.music.play()){
      this.music.play();
    }
    
  }
   
  function update() {
    if (this.ship) {
      if (this.cursors.left.isDown) {
        this.ship.setAngularVelocity(-150);
      } else if (this.cursors.right.isDown) {
        this.ship.setAngularVelocity(150);
      } else {
        this.ship.setAngularVelocity(0);
      }
    
      if (this.cursors.up.isDown) {
        this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
      } else {
        this.ship.setAcceleration(0);
      }
      
      // emit player movement
      var x = this.ship.x;
      var y = this.ship.y;
      var r = this.ship.rotation;
      if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
        this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
      }
      
 
      // save old position data
      this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
      };
    
      this.physics.world.wrap(this.ship, 5);
    }
    if(this.ball){
      this.ball.setAngularVelocity(Math.random(0, -50) * 50);
      this.physics.velocityFromRotation(this.ball.rotation + 1.5, 100, this.ball.body.acceleration);
      this.physics.world.wrap(this.ball, 5);
      //emit ball movement
      var x = this.ball.x;
      var y = this.ball.y;
      var r = this.ball.rotation;
      if(this.ball.oldPosition && (x != this.ball.oldPosition.x || y !== this.ball.oldPosition.y || r !== this.ball.oldPosition.rotation)){
        this.socket.emit('ballMovement', {x: this.ball.x, y: this.ball.y, rotation: this.ball.rotation});
      }

      //save old position data
      this.ball.oldPosition = {
        x: this.ball.x,
        y: this.ball.y,
        rotation: this.ball.rotation
      };
    }
  }

  function addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5,0.5).setDisplaySize(53,40);
    if([playerInfo.team ==='blue']){
      self.ship.setTint(0x0000ff);
    } else {
      self.ship.setTint(0xff0000);
    }
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
  }

  function addPlayerBullet(self, bulletInfo) {
    self.bullet = self.physics.add.image(bulletInfo.x, bulletInfo.y, 'bullet').setOrigin(0.5,0.5);
    self.ship.setMaxVelocity(300);
  }

  function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
  }