var socketio = require('socket.io')
var winChecker = require('../libs/wincheck.js');
var activeGames = {};
var utilityFunctions = require('../libs/utilityFunctions.js')
var passportSocketIo = require('passport.socketio');
var Challenge = require('../models/challenge');
var Match = require('../models/match');
var HistoryMatch = require('../models/history');

var matchmaking = require('../libs/matchmaking');
var matchListener = new matchmaking();


module.exports.listen = function(app){

    io = socketio.listen(app)

    users = io.of('/users')
    
    io.on('connection', function(socket){
    	//console.log(socket.handshake.session);
		console.log('a user connected:%s', socket );

		if(socket.request.user.logged_in){
			//Joining room with name username
			socket.join(socket.request.user.username);
		}

		
		socket.on('disconnect', function(){

			console.log(socket.playerid);
			if(socket.room !== undefined){
				
				Match.findById(socket.matchid, function (err, match) {
					if (err) return console.error(err);
						if(!match){
							return;
						}
						match.moves = utilityFunctions.create1DArrayFrom3D(activeGames[socket.room].moves);
						match.save(function (err, match) {
						if (err) return console.error(err);
					});
				});
				console.log('moves on disconnect');
			};
			console.log('user disconnected');
		});

		//game play socket actions
		socket.on('player action', function(screenPositions, boardCoordinates, turns){
			console.log(screenPositions);
			console.log(activeGames[socket.room]);
			//todo Fix undefined in moves here what is in screenpositions?
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
			if(socket.playerid === 'playerone')
			{
				activeGames[socket.room].moves[boardCoordinates.x][boardCoordinates.y][boardCoordinates.z] = 0;
			}
			else if(socket.playerid === 'playertwo'){
				activeGames[socket.room].moves[boardCoordinates.x][boardCoordinates.y][boardCoordinates.z] = 1;
			}
			console.log(activeGames[socket.room].moves);
			//Sends action to player clients
			io.sockets.in(socket.room).emit('player action', screenPositions, boardCoordinates);
		});

		socket.on('joinRoom', function(randomRoomName, matchId, _moves){
			console.log('joined room:%s', randomRoomName);

			socket.join(randomRoomName);
			if(activeGames[randomRoomName] === undefined){
				//initialize empty game
				activeGames[randomRoomName] = {
					isGame:'active', 
					playerOne:undefined, 
					playerTwo:undefined, 
					turns:0,
					moves: _moves
				};  
			}
			
			if(matchId !== undefined){
				console.log('Matchid = ' + matchId);
				socket.matchid = matchId;
			}
			socket.room = randomRoomName;
		});
		socket.on('assignplayer', function(playerid, roomName, playerunique){

			if(socket.playerid === undefined)
			{				
				if(playerid === 'playerone')
				{
					activeGames[roomName].playerOne = playerunique;
				}
				else if(playerid === 'playertwo')
				{
					activeGames[roomName].playerTwo = playerunique;	
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
			  //TODO testing so that we dont overuse the db connection with needless remove calls
			  if(activeGames[socket.room].isGame === 'finished'){
			  	console.log('GAME IS FINISHED DONT MAKE DUPLICATE HISTORY');
			  	return;
			  }
			  activeGames[socket.room].isGame = 'finished';
			  Match.findById(socket.matchid, function (err, match) {
					if (err) return console.error(err);
					console.log(socket.matchid);
					console.log(match);

					var historyMatch = new HistoryMatch({ 
						playerOneId: match.playerOneId,
 						playerTwoId: match.playerTwoId, 
						winner:winResult[0], 
						moves: utilityFunctions.create1DArrayFrom3D(activeGames[socket.room].moves),
						turns: activeGames[socket.room].turns,
						winningMoves: utilityFunctions.create1DArrayFrom3D(activeGames[socket.room].moves),
						gameType: 'test',
						gameState: 'finished'
					});

					historyMatch.save(function (err, challenge) {
						if (err) return console.error(err);
						match.remove({ _id: socket.matchid }, function(err, deletedMatch) {
		                    if (err) return console.error(err);
		                });
					});
				});
			}
		});
		//Menu socket actions
		socket.on('challenge', function(recieverName, challengerName){
			//Create and save a challenge in db
			console.log('testing challenge rec: %s chall:%s', recieverName, challengerName);
			var challenge = new Challenge({ challenger: challengerName, reciever: recieverName, state:'notused' });
			
			challenge.save(function (err, challenge) {
				  if (err) return console.error(err);
			});
			io.to(recieverName).emit('recieveChallenge', challengerName);

		});
		socket.on('error', function (err) { 
			console.error(err.stack); // TODO, cleanup
		})
		socket.on('addMeToQueue', function(){
			matchListener.enterRandomQueue(socket.request.user.username);
			
		});
		socket.on('accChall', function(gameurl, reciever, challenger){
			//TODO io.to(not yourown username)
			//Skicka info för att kunna göra en dialog typ x accepted your challenge, go to match or later.
			console.log(reciever);
			console.log('THIS BE THE reciever' + reciever);
			io.to(challenger).emit('oppoAccedChall', reciever);
		});
		
    })

	matchListener.on('match', function(result) {
		var match = new Match({ playerOneId: result.a['userName'], playerTwoId: result.b['userName'], gameType:'randomQueue', gameState:'waiting' });

		match.save(function (err, savedMatch) {
		    if (err) return console.error(err);

			io.to(result.a['userName']).emit('joinMatchWithRoom', result.room, 'playerone', result.a['userName'], savedMatch._id);
			io.to(result.b['userName']).emit('joinMatchWithRoom', result.room, 'playertwo', result.a['userName'], savedMatch._id);
		});
			    
	});

    return io
}


/*
passportSocketIo.filterSocketsByUser(io, function(user){
		  return user.username === recieverName;
		}).forEach(function(socket){
			console.log('reallllly?');
		  
});
*/