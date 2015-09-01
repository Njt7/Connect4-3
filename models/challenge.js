var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Challenge = new Schema({
    challenger: String,
    reciever: String,
    state: String 
    //Viewed, accepted etc
});

module.exports = mongoose.model('challenge', Challenge);
