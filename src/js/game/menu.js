class GameMenu {

    constructor() {
        this.self = { id: null, name: null, ready: false, sprite: null };
        this.other = { id: null, name: null, ready: false, sprite: null };
        this.pad = null;
        this.sentReadyInfo = false;
        this.player1Sprite = null;
        this.player2Sprite = null;
    }

    preload() {
        this.music = this.add.audio('main_menu');
        this.music.loop = true;
        this.soundColi = this.add.audio('sound_coli');
        this.soundFleur = this.add.audio('sound_fleur');
    }

    create() {
        this.createBackground();
        this.createTitle();
        this.createCharacters();
        this.createTexts();
        this.initInputs();

        this.music.play();
        let that = this;
        game.socket.emit('newplayer');
        game.socket.on('selfplayer', function (data) {
            that.setPlayer(that.self, data.self);
            if (that.self.id === 1) {
                that.setPlayer(that.other, data.others[0]);
            }
        });
        game.socket.on('otherplayer', function (player) {
            that.setPlayer(that.other, player);
        });
        game.socket.on('playerready', function (player) {
            if (that.self.id === player.id) {
                that.activateHero(that.self);
            } else {
                that.activateHero(that.other);
            }
        });
        game.socket.on('startgame', function () {
            game.camera.fade('#000000', 3000);
            game.camera.onFadeComplete.add(function () {
                that.music.stop();
                game.state.start('scene', true, false, that.self.id);
            }, this);
        });

        game.socket.on('disconnect', function () {
            that.removePlayer();
        });
    }

    update() {
        if (this.pad.justReleased(Phaser.Gamepad.XBOX360_A)) {
            if(!this.sentReadyInfo) {
                this.sentReadyInfo = true;
                this.activateHero(this.self);
                game.socket.emit('playerready');
            } else {             
                //spam sound
            }
        }
    }

    setPlayer(player, playerData) {
        console.log(player);
        player.id = playerData.id;
        player.name = player.id === 0 ? 'Fleur' : 'Coli';
        player.sprite = player.id === 0 ? this.player1Sprite : this.player2Sprite;
        player.ready = playerData.ready;
        if (player.ready) {
            this.activateHero(player, true);
        }
    }
    
    removePlayer() {

        if(this.other.ready) {
            this.desactivateHero(this.other);
        }
        
    }

    activateHero(player, skip) {
        player.ready = true;
        player.sprite.alpha = 1;
        if(!skip) {
            if (player.id === 0) {
                this.soundColi.play();
                game.add.tween(this.bulle1).to({ alpha: 0 }, 500, "Quart.easeInOut").start();
            } else {
                this.soundFleur.play();
                game.add.tween(this.bulle2).to({ alpha: 0 }, 500, "Quart.easeInOut").start();
            }
        } else {
            if (player.id === 0) {
                this.bulle1.alpha = 0;
            } else {
                this.bulle2.alpha = 0;
            }
        }
        // Animation of the hero
        player.sprite.animations.play('ready');
        player.sprite.animations.currentAnim.onComplete.add(function () {
            player.sprite.animations.play('walk');
        });

    }

    desactivateHero(player) {
        player.sprite.alpha = 0.6;
        this.other.ready = false;
        if (player.id === 0) {
            this.bulle1.alpha = 1;
        } else {
            this.bulle2.alpha = 1;
        }
        player.sprite.animations.stop();
        player.sprite.frame = 8;
    }

    createBackground() {
        game.stage.backgroundColor = MENU_BACKGROUND;
        this.background = game.add.sprite(0, 0, 'background_title');
        this.background.animations.add('default', [0, 1], 1, true).play();
    }

    createCharacters() {
        this.player2Sprite = game.add.sprite(game.world.centerX + (game.world.centerX / 2) - (HEROWIDTH / 2), game.world.height - MENU_HEROS_POS_Y, 'coli');
        this.player1Sprite = game.add.sprite((game.world.centerX / 2) - (HEROWIDTH / 2), game.world.height - MENU_HEROS_POS_Y, 'fleur');
        this.player1Sprite.alpha = 0.6;
        this.player2Sprite.alpha = 0.6;
        this.player1Sprite.frame = 8;
        this.player2Sprite.frame = 8;
        this.player1Sprite.animations.add('ready', [2, 3, 4, 5, 6, 7], 10, false);
        this.player2Sprite.animations.add('ready', [2, 3, 4, 5, 6, 7], 10, false);
        this.player1Sprite.animations.add('walk', [13, 14, 15, 16], 10, true);
        this.player2Sprite.animations.add('walk', [13, 14, 15, 16], 10, true);
        this.bulle1 = game.add.sprite(this.player1Sprite.x + (this.player1Sprite.width / 2) - BULLE_SKEW, this.player1Sprite.y - BULLE_HEIGHT, 'bulle');
        this.bulle1.anchor.set(0.5, 0);
        this.bulle1.scale.setTo(-1, 1);
        this.bulle2 = game.add.sprite(this.player2Sprite.x + (this.player1Sprite.width / 2) + BULLE_SKEW, this.player2Sprite.y - BULLE_HEIGHT, 'bulle');
        this.bulle2.anchor.set(0.5, 0);
        this.bulle1.animations.add('default', [0, 1], 4, true).play();
        this.bulle2.animations.add('default', [0, 1], 4, true).play();
    }

    createTitle() {
        this.title = game.add.sprite(game.world.centerX, MENU_TITLE_HEIGHT, 'anim_title');
        this.title.anchor.set(0.5, 0);
        this.title.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7], 4, false).play();
    }

    createTexts() {
        this.waitingText = game.add.text(game.world.centerX, game.world.centerY + MENU_TEXT_WAITING_HEIGHT, MENU_TEXT_WAITING, { font: MENU_TEXT_WAITING_FONT, fill: MENU_TEXT_WAITING_COLOR });
        this.waitingText.anchor.set(0.5);
        game.add.tween(this.waitingText).to({ alpha: 0 }, 3000, "Quart.easeInOut", true, 0, true, true).loop();

        this.readyText = game.add.text(16, 16, 'Press ?? to start !', { fontSize: '32px', fill: '#000' });
        this.readyText.alpha = 0;

        this.fleurText = game.add.text(0 + MENU_TEXT_FLEUR_WIDTH, game.world.centerY + MENU_TEXT_FLEUR_HEIGHT, MENU_TEXT_FLEUR, { font: MENU_TEXT_FLEUR_FONT, fill: MENU_TEXT_FLEUR_COLOR });
        this.ColiText = game.add.text(game.world.centerX + MENU_TEXT_COLI_WIDTH, game.world.centerY + MENU_TEXT_COLI_HEIGHT, MENU_TEXT_COLI, { font: MENU_TEXT_COLI_FONT, fill: MENU_TEXT_COLI_COLOR });

    }

    initInputs() {
        game.input.gamepad.start();
        this.pad = game.input.gamepad.pad1;
        console.log('Pad initialized');
    }

}
