//Client socket.io

var socket = io();

socket.on('connection2', function(msg){
  console.log('client socket.on :%s', msg);

});

socket.on('oppoAccedChall', function(challengeInformation){
	$("#dialog").dialog("open");
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


// Add listener for recievers only
socket.on('recieveChallenge', function(challengerName){
	/*
	var r = confirm(challengerName +' wants to challenge you!?');
	if (r == true) {
	    x = "You pressed OK!";
	} else {
	    x = "You pressed Cancel!";
	}
	*/

	$(function() {
		$('#dialog').data('challengerName', challengerName).dialog("open");
	});
});

