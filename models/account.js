var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    updated: { type: Date, default: Date.now },
    password: String
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);