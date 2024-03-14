$(document).ready(function(){
	const socket = io();
	
	$(document).on('keydown', function(e){
		// console.log(e.originalEvent.key, e.originalEvent.keyCode);
		if(e.keyCode == 38 || e.keyCode == 87){ //up arrow key or W
			socket.emit('keyPress', {key: 'up', state: true})
		}else if(e.keyCode == 37 || e.keyCode == 65){ // left arrow key or A
			socket.emit('keyPress', {key: 'left', state: true})
		}else if(e.keyCode == 40 || e.keyCode == 83){ // down arrow key or S
			socket.emit('keyPress', {key: 'down', state: true})
		}else if(e.keyCode == 39 || e.keyCode == 68){ // right arrow key or D
			socket.emit('keyPress', {key: 'right', state: true})
		}else if(e.keyCode == 16){ // shift
			socket.emit('keyPress', {key: 'shift', state: true})
		}else if(e.keyCode == 69){ // E
			socket.emit('keyPress', {key: 'attack', state: true})
		}else if(e.keyCode == 81){ // Q
			socket.emit('keyPress', {key: 'cast', state: true})
		}
	});
	
	$(document).on('keyup', function(e){
		// console.log(e.originalEvent.key, e.originalEvent.keyCode);
		if(e.keyCode == 38 || e.keyCode == 87){ //up arrow key or W
			socket.emit('keyPress', {key: 'up', state: false})
		}else if(e.keyCode == 37 || e.keyCode == 65){ // left arrow key or A
			socket.emit('keyPress', {key: 'left', state: false})
		}else if(e.keyCode == 40 || e.keyCode == 83){ // down arrow key or S
			socket.emit('keyPress', {key: 'down', state: false})
		}else if(e.keyCode == 39 || e.keyCode == 68){ // right arrow key or D
			socket.emit('keyPress', {key: 'right', state: false})
		}
		
		if(e.keyCode == 16){ // shift
			socket.emit('keyPress', {key: 'shift', state: false})
		}else if(e.keyCode == 69){ // E
			socket.emit('keyPress', {key: 'attack', state: false})
		}else if(e.keyCode == 81){ // Q
			socket.emit('keyPress', {key: 'cast', state: false})
		}
	});
	
	socket.on('drawNewSprite', function(data){
		$('#world').append('<div class="hpbar '+data.player.selector+'"></div>');
		$('.'+data.player.selector).css({'left': data.player.posX + "px", 'top': data.player.posY + "px", 'width': data.player.hp + "px"});
		$('#world').append('<div id='+data.player.selector+' class="players"></div>');
		$('#'+data.player.selector).css('background', "url('/images/characters/Warrior_"+data.player.color+".png') "+data.player.poseX+"px "+data.player.poseY+"px").css('left', data.player.posX + "px").css('top', data.player.posY + "px").css('transform', "scaleX("+data.player.scaleX+")").css('rotate', data.player.rotate + "deg");
	});
	
	socket.on('drawSprites', function(data){
		for(let i in data.players){
			$('#world').append('<div class="hpbar '+data.players[i].selector+'"></div>');
			$('.'+data.players[i].selector).css({'left': data.players[i].posX + "px", 'top': data.players[i].posY + "px", 'width': data.players[i].hp + "px"});
			$('#world').append('<div id='+data.players[i].selector+' class="players"></div>');
			$('#'+data.players[i].selector).css('background', "url('/images/characters/Warrior_"+data.players[i].color+".png') "+data.players[i].poseX+"px "+data.players[i].poseY+"px").css('left', data.players[i].posX + "px").css('top', data.players[i].posY + "px").css('transform', "scaleX("+data.players[i].scaleX+")").css('rotate', data.players[i].rotate + "deg");
		}
	});
	
	socket.on('moveSprite', function(data){
		$('.'+data.player.selector).css({'left': data.player.posX + "px", 'top': data.player.posY + "px", 'width': data.player.hp + "px"});
		$('#'+data.player.selector).css({'left': data.player.posX + "px", 'top': data.player.posY + "px", 'transform': "scaleX("+data.player.scaleX+")", 'background-position': data.player.poseX+"px "+data.player.poseY+"px"});
	});
	
    $(document).on('submit', 'form', function(){
		let chat = $(this).children('#chat').val();
		socket.emit('chatted', {input: chat});
        return false;
    })
});