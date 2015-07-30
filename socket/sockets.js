var socketio = require('socket.io')
var winChecker = require('../libs/wincheck');


module.exports.listen = function(app){
    io = socketio.listen(app)

    users = io.of('/users')
    
    io.on('connection', function(socket){
		console.log('a user connected:%s', socket );
			socket.on('disconnect', function(){
			console.log('user disconnected');
		});
		socket.on('chat message', function(msg){
			console.log('message: ' + msg);
			io.emit('chat message', msg);
		});
		socket.on('player action', function(data, turns){
			if(turns === 1 && socket.playerid === 'playerone'){
				console.log('illegal move from playerone');
				return;
			}
			if(turns === 0 && socket.playerid === 'playertwo'){
				console.log('illegal move from playertwo');
				return;
			}
			for (var key in data)
			{
				console.log('data key%s', key);
			}

			for (var key in socket)
			{
				console.log('socket key%s', key);
			}
			for (var key in io.sockets.in(socket.room))
			{
				console.log('io.sockets.in.room key %s', key);
			}
			io.sockets.in(socket.room).emit('player action', data);
			console.log('io.sockets%s', data);
		});

		socket.on('joinRoom', function(data){
			socket.join(data);
			socket.room = data;
			console.log('joined room:%s', data);
		});
		socket.on('assignplayer', function(data){
			if(socket.playerid === undefined)
			{
				socket.playerid = data;
				console.log('socket.playerid: %s', socket.playerid);
			}
		});
		socket.on('match', function(data){
			console.log('WAOW');
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