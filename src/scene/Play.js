class Play extends Phaser.Scene {
    constructor() {
      super("playScene");
    }
    preload(){
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('rango', './assets/RangoPXL.png');
        this.load.image('borat', './assets/BoratPXL.png');
        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }
    create() {
        if(window.localStorage){
            console.log('Local storage is supported');
        } else {
            console.log('Local storage is not supported');
        }
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);
        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        //add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rango').setOrigin(0.5, 0.75);
        //add spaceships
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'borat', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'borat', 0, 30).setOrigin(0, 0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'borat', 0, 10).setOrigin(0,0);
        //define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        //animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {start: 0, end: 9, first: 0}),
            frameRate: 30
        });
        //initialize score
        this.p1Score = 0
        this.highScore = this.p1Score
        //display high score
        let highConfig = {
            fontFamily: 'Fantasy',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.highCenter = this.add.text(borderUISize + borderPadding + 225, borderUISize + borderPadding*2, this.p1Score, highConfig);
        //display score
        let scoreConfig = {
            fontFamily: 'Fantasy',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding + 450, borderUISize + borderPadding*2, this.p1Score, scoreConfig);
        this.timeRight = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, game.settings.timer, scoreConfig);
        // GAME OVER flag
        this.gameEnd = false
        
        // 60-second play clock
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.gameEndCheck,
            callbackScope: this,
            loop: true,
        });

    }
    update() {
        //check key input for restart
        if(this.gameEnd && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameEnd && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }
        this.starfield.tilePositionX -= 4;
        this.p1Rocket.update();
        this.ship01.update();
        this.ship02.update();
        this.ship03.update();
        //check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
            this.game.settings.gameTimer += 1000;
        }
        if(this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
            if(!game.settings.gameTimer < 60){
                this.game.settings.gameTimer += 1000;
            }
        }
        if(this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
            this.game.settings.gameTimer += 1000;
        }
        if(!this.gameEnd){
            this.p1Rocket.update();
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
        }
    }
    checkCollision(rocket, ship) {
        //simple AABB checking
        if (rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y) {
                return true;
        } else {
            return false;
        }
    }
    shipExplode(ship) {
        //temporarily hide ship
        ship.alpha = 0
        //create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset()
            ship.alpha = 1;
            boom.destroy();
        });
        //score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
        this.sound.play('sfx_explosion')
    }
    gameEndCheck() {
        //Timer
        let endConfig = {
            fontFamily: 'Fantasy',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        if(!this.gameEnd){
            game.settings.gameTimer -= 1000;
            this.timeRight.text = game.settings.gameTimer / 1000;
        }
        if(game.settings.gameTimer <= 0){
            endConfig.fixedWidth = 0;
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', endConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or <- for Menu', endConfig).setOrigin(0.5);
            this.gameEnd = true;
        }
        
    }
  }