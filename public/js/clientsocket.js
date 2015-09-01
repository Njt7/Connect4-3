//Client socket.io

var socket = io();

socket.on('connection2', function(msg){
  console.log('client socket.on :%s', msg);
});


/* Add listener for recievers only
socket.on('reciever', function(challengerName){
	var r = confirm(challengerName +' wants to challenge you!?');
	if (r == true) {
	    x = "You pressed OK!";
	} else {
	    x = "You pressed Cancel!";
	}
});
*/