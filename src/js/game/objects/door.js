class Door {

    constructor(obj, group) {
        if (obj.properties.Orientation === 'vertical') {
            this.sprite = game.add.sprite(obj.x, obj.y, 'door');
        } else {
            this.sprite = game.add.sprite(obj.x, obj.y, 'door_horizontal');
        }
        group.add(this.sprite);
        this.sprite.body.immovable = true;
        this.sprite.anchor.setTo(0, 1);
        this.sprite.colorParam = obj.properties.Color;
        this.setColor(this.sprite.colorParam);
    }

    setColor(color) {
        switch (color) {
            case GREEN:
                this.sprite.frame = 20;
                this.sprite.animations.add('open', [20,21,22,23,24,25,26,27,28,29], 14, false)
                this.sprite.animations.add('close', [29,28,27,26,25,24,23,22,21,20], 14, false)
                break;
            case ORANGE:
                this.sprite.frame = 10;
                this.sprite.animations.add('open', [10,11,12,13,14,15,16,17,18,19], 14, false)
                this.sprite.animations.add('close', [19,18,17,16,15,14,13,12,11,10], 14, false)
                break;
            case RED:
                this.sprite.frame = 0;
                this.sprite.animations.add('open', [0,1,2,3,4,5,6,7,8,9], 14, false)
                this.sprite.animations.add('close', [9,8,7,6,5,4,3,2,1,0], 14, false)
                break;
            case WHITE:
                this.sprite.frame = 30;
                this.sprite.animations.add('open', [30,31,32,33,34,35,36,37,38,39], 14, false)
                this.sprite.animations.add('close', [39,38,37,36,35,34,33,32,31,30], 14, false)
                break;
        }
    }
}