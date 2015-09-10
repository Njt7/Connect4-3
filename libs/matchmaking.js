var util = require('util');
var EventEmitter = require('events').EventEmitter;

var matchmaker = require('matchmaker');
var mymatch = new matchmaker;

//Todo remove duplicate queued users.
// @station - an object with `freq` and `name` properties
var matchmaking = function() {

    // we need to store the reference of `this` to `self`, so that we can use the current context in the setTimeout (or any callback) functions
    // using `this` in the setTimeout functions will refer to those funtions, not the Radio class
    var self = this;
    
    // emit 'open' event instantly
    /*
    setTimeout(function() {
        self.emit('open', station);
    }, 0);
    
    // emit 'close' event after 5 secs
    setTimeout(function() {
        self.emit('close', station);
    }, 5000);
    */

    this.enterRandomQueue = function (_user){
        console.log('User: %s entered random queue', _user);
        mymatch.push({ userName : _user });
    }
    
    mymatch.on('match', function(result) {
      console.log(result.a); // match a
      console.log(result.b); // match b
      result.room = generateRoom(10);
      for(var key in result) { console.log("key " + key + " has value " + result[key]); } 
        
      self.emit('match', result);
    });


    // EventEmitters inherit a single event listener, see it in action
    this.on('newListener', function(listener) {
        console.log('Event Listener: ' + listener);
    });
};


//matchmaking
mymatch.policy = function(a,b) {
    if (a.userName !== b.userName)
        return 100
    else 
        return 0
};

mymatch.start();

function generateRoom(length) {
    var haystack = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var room = '';
 
    for(var i = 0; i < length; i++) {
        room += haystack.charAt(Math.floor(Math.random() * 62));
    }
 
    return room;
};

util.inherits(matchmaking, EventEmitter);

module.exports = matchmaking;

