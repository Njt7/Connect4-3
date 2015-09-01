var mongoose = require('mongoose');
var utilityFunctions = require('../libs/utilityFunctions.js');
var Schema = mongoose.Schema;

//TODO arrayfix

var HistoryMatch = new Schema({
    playerOneId: String,
    playerTwoId: String,
    winner: String,
    moves: [Number],
    turns: Number,
    winningMoves: [Number], // The 4 winning positions,
    gameType: String,  //Hotseat, vsAi, vsPlayer
    gameState: String //Active, finished, waiting
});

module.exports = mongoose.model('historyMatch', HistoryMatch);
