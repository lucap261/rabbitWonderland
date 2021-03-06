"use strict";

/* This variable will contain all the sprites used in the game. */
var sprites = {};

var sounds = {};

var carrots = []; 

var correctAnswer = 5;

/* All sprite loading should be done in this function. The function is automatically called in the game engine. */
Game.loadAssets = function () {
    sprites.background = Game.loadSprite("assets/img/Background.jpg");
    sprites.cannon = Game.loadSprite("assets/spr_cannon_barrel.png");
    sprites.ball = Game.loadSprite("assets/spr_ball.png");
    sprites.ufo = Game.loadSprite("assets/spr_ufo.png");

    sprites.rabbit = Game.loadSprite("assets/img/rabbit3.png");
    sprites.carrot = Game.loadSprite("assets/img/carrots11.png");

    sprites.number1 = Game.loadSprite("assets/img/number1.png");
    sprites.number2 = Game.loadSprite("assets/img/number2.png");
    sprites.number3 = Game.loadSprite("assets/img/number3.png");
    sprites.number4 = Game.loadSprite("assets/img/number4.png");
    sprites.number5 = Game.loadSprite("assets/img/number5.png");

    sounds.music = Game.loadSound("assets/Music/music");
    sounds.wellDone = Game.loadSound("assets/Music/wellDone2");
    sounds.failure = Game.loadSound("assets/Music/failure");

    sounds.music.loop = true;
    sounds.wellDone.loop = false;
    sounds.failure.loop = false;
};

/* Here we create the game world. In this example, a separate class (called GameWorld) is used for that. */
Game.initialize = function () {
    Game.gameWorld = new GameWorld();
};

// ==================================================================================

/* GameObject is a class for representing a simple object in a game. This is basically a sprite with a
   position, orientation, origin, and velocity. The object can optionally be visible.
 */
function GameObject() {
    this.sprite = undefined;
    this.position = Vector2.zero;
    this.origin = Vector2.zero;
    this.rotation = 0;
    this.visible = true;
};

/* A property that gives the bounding box of the game object. Useful for collision handling. */
Object.defineProperty(GameObject.prototype, "box",
    {
        get: function () {
            var leftTop = this.position.subtract(this.origin);
            return new Rectangle(leftTop.x, leftTop.y, this.sprite.width, this.sprite.height);
        }
    });

/* This method draws the object on the screen. It's called automatically by the game engine. */
GameObject.prototype.draw = function () {
    if (this.visible)
        Canvas2D.drawImage(this.sprite, this.position, this.origin, this.rotation);
};

// ==================================================================================

/* The Cannon class is a subclass of GameObject. It represents a cannon that follows the mouse
   pointer in the y direction.
 */
function Cannon() {
    GameObject.call(this);
    this.sprite = sprites.cannon;
    this.origin = new Vector2(0, 34);
}

Cannon.prototype = Object.create(GameObject.prototype); // needed for proper inheritance in JavaScript

Cannon.prototype.handleInput = function () {
    this.position.y = Mouse.position.y
};

// ==================================================================================

/* The Ball class (also a subclass of GameObject) represents the ball that is shot at the moving ufo. */
function Ball() {
    GameObject.call(this);
    this.sprite = sprites.ball;
    this.origin = new Vector2(11, 11);
    this.visible = false;
}

Ball.prototype = Object.create(GameObject.prototype); // needed for proper inheritance in JavaScript

/* Input handling: if the player presses the left mouse button, the ball gets a velocity and becomes visible. */
Ball.prototype.handleInput = function () {
    if (Mouse.left.pressed && !this.visible) {
        this.visible = true;
        this.velocity = new Vector2(500, 0)
    }
};

/* Updating the ball. */
Ball.prototype.update = function (delta) {
    if (this.visible) {
        // if the ball is visible, simply add the velocity to the current position
        this.position.x += this.velocity.x * delta;
    }
    else {
        // otherwise, simply set ball position at the cannon position.
        this.position.x = 100;
        this.position.y = Game.gameWorld.cannon.position.y;
    }
    if (this.position.x > Game.size.x) {
        // if the ball flies outside of the screen, make it invisible and subtract points
        // for not touching the ufo
        this.visible = false;
        Game.gameWorld.score -= 10;
    }
};

// ==================================================================================

/* The Ufo class represents the moving ufo in the game. */
function Ufo() {
    GameObject.call(this);
    this.sprite = sprites.ufo;
    this.timePassed = 0;
    this.setRandomPosition();
}

Ufo.prototype = Object.create(GameObject.prototype); // needed for proper inheritance in JavaScript

/* Updating the ufo. */
Ufo.prototype.update = function (delta) {
    // increase the timer (timePassed)
    this.timePassed += delta;
    if (this.timePassed > 2) {
        // after two seconds, set a new random position and reset the timer
        this.setRandomPosition();
        this.timePassed = 0;
    }
    if (this.box.intersects(Game.gameWorld.ball.box)) {
        // if the ball collides with the ufo, reset the ball and the ufo and add
        // points to the score
        this.setRandomPosition();
        this.timePassed = 0;
        Game.gameWorld.score += 10;
        Game.gameWorld.ball.visible = false;
    }
};

/* Sets the ufo at a random position. */
Ufo.prototype.setRandomPosition = function () {
    this.position.x = Math.random() * (Game.size.x - 200 - this.sprite.width) + 200;
    this.position.y = Math.random() * (Game.size.y - this.sprite.height);
};

// ==================================================================================

/* The Carrot class represents the carrot in the game. */
function Carrot(x, y) {
    GameObject.call(this);
    this.sprite = sprites.carrot;
    this.setPosition(x, y);

    this.visible = false;
}

Carrot.prototype = Object.create(GameObject.prototype); // needed for proper inheritance in JavaScript

/* Sets the ufo at a random position. */
Carrot.prototype.setPosition = function (x, y) {
    this.position.x = x;
    this.position.y = y;
};

// ==================================================================================

/* The Carrot class represents the carrot in the game. */
function Rabbit(x, y) {
    GameObject.call(this);
    this.sprite = sprites.rabbit;
    this.setPosition(x, y);

    this.visible = true;
}

Rabbit.prototype = Object.create(GameObject.prototype); // needed for proper inheritance in JavaScript

/* Sets the ufo at a random position. */
Rabbit.prototype.setPosition = function (x, y) {
    this.position.x = x;
    this.position.y = y;
};

// ==================================================================================

/* The Number class */
function Number(img, x, y, id) {
    GameObject.call(this);
    this.sprite = img;
    this.setPosition(x, y);
    this.visible = true;

    this.id = id;
}

Number.prototype = Object.create(GameObject.prototype); // needed for proper inheritance in JavaScript

/* Input handling: if the player presses the left mouse button, the ball gets a velocity and becomes visible. */
Number.prototype.handleInput = function () {
    //console.log(Mouse.left.pressed && this.box.contains(Mouse.position));
    if (Mouse.left.pressed && this.box.contains(Mouse.position)) {
        
        if (this.id == correctAnswer) {
            sounds.wellDone.play();

            correctAnswer = generateCarrots();

            //Game.gameWorld.rabbit.sprite = sprites.carrot;
        } else {
            sounds.failure.play();
        }
    }
};

/* Updating the Number. */
Number.prototype.update = function (delta) {
    if (this.visible) {
        // if the ball is visible, simply add the velocity to the current position
        this.position.x += this.velocity.x * delta;
    }
    else {
        // otherwise, simply set ball position at the cannon position.
        this.position.x = 100;
        this.position.y = Game.gameWorld.cannon.position.y;
    }
    if (this.position.x > Game.size.x) {
        // if the ball flies outside of the screen, make it invisible and subtract points
        // for not touching the ufo
        this.visible = false;
        Game.gameWorld.score -= 10;
    }
};

/* Sets the Number a position. */
Number.prototype.setPosition = function (x, y) {
    this.position.x = x;
    this.position.y = y;
};

// ==================================================================================

/* The GameWorld class aggregates all the game object in the world, in this case the cannon,
   the ball and the ufo. It also contains a variable representing the current score.
 */
function GameWorld() {
    this.cannon = new Cannon();
    this.ball = new Ball();
    this.ufo = new Ufo();
    this.score = 0;

    this.rabbit = new Rabbit(50, 200);

    var deltaCarrot = 100;
    var xPos = 250;
    var yPos = 120;
    this.carrot1 = new Carrot(xPos, yPos);        
    this.carrot2 = new Carrot(xPos += deltaCarrot, yPos);
    this.carrot3 = new Carrot(xPos += deltaCarrot, yPos);
    this.carrot4 = new Carrot(xPos += deltaCarrot, yPos);
    this.carrot5 = new Carrot(xPos += deltaCarrot, yPos);

    carrots.push(this.carrot1);
    carrots.push(this.carrot2);
    carrots.push(this.carrot3);
    carrots.push(this.carrot4);
    carrots.push(this.carrot5);

    correctAnswer = generateCarrots();

    this.number = new Number();

    var deltaNumber = 100;
    xPos = 225;
    yPos = 375;
    this.number1 = new Number(sprites.number1, xPos, yPos, 1);        
    this.number2 = new Number(sprites.number2, xPos += deltaNumber, yPos, 2);
    this.number3 = new Number(sprites.number3, xPos += deltaNumber, yPos, 3);
    this.number4 = new Number(sprites.number4, xPos += deltaNumber, yPos, 4);
    this.number5 = new Number(sprites.number5, xPos += deltaNumber, yPos, 5);

    //alert(getRandomInt(1, 5));

    sounds.music.play();
}

/* Let each object handle their own input. */
GameWorld.prototype.handleInput = function () {
    this.cannon.handleInput();
    this.ball.handleInput();

    this.number1.handleInput();
    this.number2.handleInput();
    this.number3.handleInput();
    this.number4.handleInput();
    this.number5.handleInput();
};

/* Let each object update itself. */
GameWorld.prototype.update = function (delta) {
    this.ball.update(delta);
    this.ufo.update(delta);
};

/* Drawing everything on the screen in the right order. */
GameWorld.prototype.draw = function () {
    // (sprite, position, origin, rotation, scale)
    Canvas2D.drawImage(sprites.background, new Vector2(0, 70));
    //this.ball.draw();
    //this.cannon.draw();
    //this.ufo.draw();
    Canvas2D.drawText("Score: " + this.score, new Vector2(20, 22), Color.white);

    //text, position, color, textAlign, fontname, fontsize
    Canvas2D.drawText("Rabbit in NederLand", new Vector2(150, 0), Color.orange, undefined, undefined, "40px");
    Canvas2D.drawText("A fun way to learn how to assign numbers to quantity", new Vector2(75, 40), Color.blue, undefined, undefined, "20px");
    
    this.rabbit.draw();

    this.carrot1.draw();        
    this.carrot2.draw();
    this.carrot3.draw();
    this.carrot4.draw();
    this.carrot5.draw();

    this.number1.draw();
    this.number2.draw();
    this.number3.draw();
    this.number4.draw();
    this.number5.draw();
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCarrots() {
    for (var i = 0; i < carrots.length; i++) {
        carrots[i].visible = false;
    }

    var randomCarrots = getRandomInt(1, 5);
    for (var i = 0; i < randomCarrots; i++) {
        carrots[i].visible = true;
    }

    return randomCarrots;
}