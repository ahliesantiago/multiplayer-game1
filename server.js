const express = require("express");
const app = express();
const server = app.listen(8000);
const io = require('socket.io')(server);
const path = require("path");
const session = require('express-session');
app.use(express.static(path.join(__dirname, "./public")));
app.use(session({
    secret: 'wanabanana',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

let player_list = [];

class Player{
    constructor(selector, nth, color, id){
        this.selector = selector;
        this.playerNumber = nth;
        this.color = color;
        this.id = id; // the socket.id
        if(nth % 2 != 0){ // if odd player, the sprite's starting point should be on the left side and facing right            
            this.posX = 100;
            (nth == 3) ? this.posY = 500 : this.posY = 300;
            this.scaleX = 1;
        }else{ // if even player, the sprite's starting point should be on the right side and facing the left
            this.posX = 430;
            (nth == 4) ? this.posY = 500 : this.posY = 300;
            this.scaleX = -1;
        }
        this.hp = 100;
        this.action = "STANDING"; // default action is for the character to stand
        this.counter = 0; // this will be used for counting steps
        this.goingRight = false;
        this.goingLeft = false;
        this.goingUp = false;
        this.goingDown = false;
        this.running = false;
        this.attacking = false;
        this.casting = false;
        this.poseX = -50;
        this.poseY = -40;
        this.rotate = 0;
		// this.poses = {
		// 	'STANDING': 	{ 'y': 0, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'WALK-RIGHT':	{ 'y': 1, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'WALK-LEFT': 	{ 'y': 1, 'x': [0, 1, 2, 3, 4, 5], 'scaleX': -1 },
		// 	'WALK-DOWN':	{ 'y': 5, 'x': [5] },
		// 	'WALK-UP':	    { 'y': 7, 'x': [5] },
		// 	'ATTACK': 		{ 'y': 2, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'ATTACK2': 		{ 'y': 3, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'ATTACK-DOWN': 	{ 'y': 4, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'ATTACK2-DOWN':	{ 'y': 5, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'ATTACK-UP': 	{ 'y': 6, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'ATTACK2-UP': 	{ 'y': 7, 'x': [0, 1, 2, 3, 4, 5] },
		// 	'CAST': 		{ 'y': 2, 'x': [0, 1, 2] }
		// }
    }

	updateAction(action){ // changes the movement type
		this.counter = 0;
		this.action = action;
	}

	updatePos(){
        if(this.goingRight){
            this.updateAction("WALK_RIGHT");
            this.posX += 5;
            this.scaleX = 1;
            this.poseX = -50;
            this.poseY = -220;
            // if(this.running){
            //     this.updateAction("RUN_RIGHT");
            // }else if(this.attacking){
            //     this.updateAction("ATTACK");
            // }else if(this.casting){
            //     this.updateAction("CAST");
            // }
        }else if(this.goingLeft){
            this.updateAction("WALK_LEFT");
            this.posX -= 5;
            this.scaleX = -1;
            this.poseX = -50;
            this.poseY = -220;
        }else if(this.goingUp){
            this.updateAction("WALK_UP");
            this.posY -= 5;
            this.poseX = -995;
            this.poseY = -1380;
        }else if(this.goingDown){
            this.updateAction("WALK_DOWN");
            this.posY += 5;
            this.poseX = -1020;
            this.poseY = -1000;
        }else if(this.attacking){
            this.updateAction("ATTACK");
            this.poseX = -650;
            this.poseY = -420;
        }else if(this.casting){
            this.updateAction("CAST");
            this.poseX = -240;
            this.poseY = -415;
        }else{
            this.updateAction("STANDING");
            this.poseX = -50;
            this.poseY = -40;
        }
	}

    attack(){
        for(let playerNumber in online_players){
            if((this.posX - online_players[playerNumber].posX) >= -50 && (this.posX - online_players[playerNumber].posX) <= 60 && this.playerNumber != online_players[playerNumber].playerNumber){
                console.log(this.playerNumber, "distance from", online_players[playerNumber].playerNumber, "is", this.posX - online_players[playerNumber].posX);
                return online_players[playerNumber];
            }
        }
    }

    damaged(){
        this.hp -= 10;
    }

    heal(){
        this.hp += 10;
    }

    lose(){
        this.updateAction("STANDING");
        this.rotate = -90;
    }

    // updateCoordinate(){
	// 	if(counter >= poses[this.action].x.length){
    //     /* When counter reaches the end of the pose animation,
    //     reset counter to 0 and to STANDING pose. */
	// 		counter = 0;
	// 		this.action = 'STANDING';
	// 	}

	// 	if(this.action == 'WALK_LEFT'){
	// 		this.posX -= 10;
	// 		this.scale_x = -1;
	// 	}
	// 	else if(this.action == 'WALK_RIGHT'){
	// 		this.posX += 10;
	// 	}
	// }

	// drawPlayer(){
	// 	this.updateCoordinate();
	// 	this.drawSprite(poses[this.action].x[counter++], poses[this.action].y);
	// }

	// talk(){
	// }
}

let online_players = {};
let index = 0;
let chat_history = [];
const colors = ['Blue', 'Red', 'Purple', 'Yellow']
io.on('connection', function(socket){
    if(chat_history){
        socket.emit('printChats', {chats: chat_history});
    }
    socket.player = new Player("player" + (index + 1), index + 1, colors[index], socket.id);
    online_players[socket.id] = socket.player;
    let player = socket.player;
    // console.log(index);
    // console.log(socket.player);
    // console.log(online_players);
    console.log(player.selector, "connected. current number of players online:", Object.keys(online_players).length);
    // console.log(online_players[socket.id]);
    // console.log(player.selector);
    socket.broadcast.emit('drawNewSprite', {player: player});
    socket.emit('drawSprites', {players: online_players});
    socket.on('keyPress', function(data){
        if(player.status != "dead"){
            if(data.key == 'up'){
                player.goingUp = data.state;
            }else if(data.key == 'down'){
                player.goingDown = data.state;
            }else if(data.key == 'left'){
                player.goingLeft = data.state;
            }else if(data.key == 'right'){
                player.goingRight = data.state;
            }else if(data.key == 'cast'){
                player.casting = data.state;
                player.heal();
                io.emit('moveSprite', {player: player});
            }else if(data.key == 'attack'){
                player.attacking = data.state;
                if(player.attack()){
                    let victim = player.attack();
                    console.log(player.selector, "attacked", victim.selector);
                    victim.damaged();
                    if(victim.hp <= 0){
                        victim.lose();
                        victim.status = "dead";
                        console.log(victim);
                        delete online_players[victim.id];
                        victim.updatePos();
                        io.emit('moveSprite', {player: victim});
                    }
                    victim.updatePos();
                    io.emit('moveSprite', {player: victim});
                }
            }
        }
        player.updatePos();
        io.emit('moveSprite', {player: player});
    });
    index++;

    socket.on('chatted', function(data){
        if(data.input != ""){
            let chat = "<p>" + player.selector + ": " + data.input + "</p>";
            chat_history.push(chat);
            io.emit('printChat', {chat: chat});
        }
    });

    socket.on('disconnect', function(socket){
        index--;
        io.emit('disconnected', {player: player.selector});
        console.log(player.selector, "disconnected. current number of players online:");
        delete online_players[socket.id];
        delete player;
        console.log(Object.keys(online_players).length);
        // console.log(online_players);
    });
});
chat_history = [];
online_players = {};