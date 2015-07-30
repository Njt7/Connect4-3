var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Match = new Schema({
    playerOneId: Schema.Types.ObjectId,
    playerTwoId: Schema.Types.ObjectId,
    moves: [Number], //All of the moves
    winningMoves: [Number], // The 4 winning positions,
    gameType: String,  //Hotseat, vsAi, vsPlayer
    gameState: String //Active, finished, waiting to start
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);