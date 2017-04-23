var mongoose = require('mongoose');
var utilityFunctions = require('../libs/utilityfunctions.js');
var Schema = mongoose.Schema;

var Match = new Schema({
    playerOneId: String,
    playerTwoId: String,
    moves: { type: [Number], default: fillMoves() },
    turns: Number,
    winningMoves: [Number], // The 4 winning positions,
    gameType: String,  //Hotseat, vsAi, vsPlayer
    gameState: String //Active, finished, waiting
});

function fillMoves(){
	var filledMoves = [64];
	for (var i = 0; i < 64; i++) {
    	filledMoves[i] = -1;
    	}; //All of the moves
	return filledMoves;
}

module.exports = mongoose.model('match', Match);
