//Client socket.io

var socket = io();

socket.on('connection2', function(msg){
  console.log('client socket.on :%s', msg);

});

socket.on('oppoAccedChall', function(challengeInformation){
	$("#dialog").data(challengeInformation).dialog("open");
  	console.log('why didnt dialog open');
});

socket.on('joinMatchWithRoom', function(room, playerid, username, matchid){
  console.log('joinMatchWithRoom :%s', room);
      
  var urlString = '/game?'
                + '&mode=random'
                + '&room=' +room
                + '&playerid=' + playerid
                + '&playerunique=' +username
                + '&matchid='+ matchid;
         
  window.location.replace(urlString);
});

function queue(test){
	console.log('addmetoqueue');
	socket.emit('addMeToQueue');
};

function acceptChallenge(information){
	socket.emit('accChall', information);
};


// Add listener for recievers only
socket.on('reciever', function(challengerName){
	var r = confirm(challengerName +' wants to challenge you!?');
	if (r == true) {
	    x = "You pressed OK!";
	} else {
	    x = "You pressed Cancel!";
	}
	$("#dialog").dialog("open");

});
