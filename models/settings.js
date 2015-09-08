var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Settings = new Schema({
    username: String,
    theme: String,
    performance: Boolean,
  	challengeable: Boolean
});

module.exports = mongoose.model('settings', Settings);