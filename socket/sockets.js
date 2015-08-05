var socketio = require('socket.io')
var winChecker = require('../libs/wincheck.js');
var activeGames = {};
var utilityFunctions = require('../libs/utilityFunctions.js')


module.exports.listen = function(app){
    io = socketio.listen(app)

    users = io.of('/users')
    
    io.on('connection', function(socket){
		console.log('a user connected:%s', socket );
		
		socket.on('disconnect', function(){

			console.log(socket.playerid);
			console.log('user disconnected');
		});
		socket.on('chat message', function(msg){

			console.log('message: ' + msg);
			io.emit('chat message', msg);
		});
		socket.on('player action', function(screenPositions, turns){

			if(activeGames[socket.room].turns%2 === 1 && socket.playerid === 'playerone')
			{
				console.log('illegal move from playerone');
				return;
			}
			else if(activeGames[socket.room].turns%2 === 0 && socket.playerid === 'playertwo')
			{
				console.log('illegal move from playertwo');
				return;
			}
			//Increment turns by 1;
			activeGames[socket.room].turns++;

			//Add action to server side representation of the game
			var boardCoordinates = utilityFunctions.screenToBoardPosition(screenPositions);
			if(socket.playerid === 'playerone')
			{
				activeGames[socket.room].moves[boardCoordinates.x, boardCoordinates.y, boardCoordinates.z] = 0;
			}
			else if(socket.playerid === 'playertwo'){
				activeGames[socket.room].moves[boardCoordinates.x, boardCoordinates.y, boardCoordinates.z] = 1;
			}
			console.log(activeGames[socket.room].moves);
			//Sends action to player clients
			io.sockets.in(socket.room).emit('player action', screenPositions);
		});

		socket.on('joinRoom', function(randomRoomName){

			console.log('joined room:%s', randomRoomName);
			console.log('lets watch what happens here %s', utilityFunctions.createArray(4, 4, 4));
			socket.join(randomRoomName);
			if(activeGames[randomRoomName] === undefined){
				//initialize empty game
				activeGames[randomRoomName] = {
					isGame:'active', 
					playerOne:undefined, 
					playerTwo:undefined, 
					turns:0,
					moves:utilityFunctions.createArray(4, 4, 4)
				};  
			}
			socket.room = randomRoomName;
		});
		socket.on('assignplayer', function(playerid, roomName, playerunique){

			if(socket.playerid === undefined)
			{				
				if(playerid === 'playerone')
				{
					activeGames[roomName].playerone = playerunique;
				}
				else if(playerid === 'playertwo')
				{
					activeGames[roomName].playertwo = playerunique;	
				}
				socket.playerid = playerid;
				console.log('socket.playerid: %s', socket.playerid);
			}
		});
		socket.on('match', function(data){
			console.log('WAOW');//todo ???
		});
		socket.on('win check', function(nX, nY, nZ, player, moves){
			//winChecker.checkAll(nX, nY, nZ, moves, player);
			var winResult = winChecker.checkAll(nX, nY, nZ, player, moves);
			console.log(winResult);
			if(winResult){//Todo room specific emit
			  socket.emit('winner', winResult);
			}
		});
    })

    return io
}