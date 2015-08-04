var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var matchmaking = require('../libs/matchmaking');
var router = express.Router();
var savedResponses = {};

var matchListener = new matchmaking();

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { } );
});

router.post('/register', function(req, res, next) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});


router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res, next) {
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/mainMenu', function(req, res, next) {
    res.render('mainMenu', { user : req.user });
});

router.get('/game', function(req, res, next) {
    res.render('game', { user : req.user });
});

router.get('/hotseat', function(req, res) {
  var string = encodeURIComponent('hotseat');
  res.redirect('game/?room=' + string );
});


router.get('/contact', function(req, res) {
    res.send({ some: 'json' });
});

router.get('/challenge', function(req, res) {
    res.send( 'This feature isnt ready yet' );
});

router.get('/settings', function(req, res) {
    res.send( 'This feature isnt ready yet' );
});
router.get('/notuser', function(req, res) {
    res.send( 'This feature is only available for logged in users' );
});
router.get('/notready', function(req, res) {
    res.send( 'This feature isnt ready yet' );
});



router.get('/randomqueue', function(req, res) {
    //console.log("req.id %s", req.params.id);

    savedResponses[req.user._id] = res;
    console.log('saved Responeses %s', savedResponses[req.user._id]);
    matchListener.enterRandomQueue(req.user._id);

    //var string = encodeURIComponent('hotseat');
    //res.redirect('game/?room=' + string);
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

//Events
matchListener.on('match', function(result) {
    //Redirecting saved responses to a unique response
    //savedResponses[result.a['userId']].redirect('game/?mode=unranked&room=' + result.room);
    //savedResponses[result.b['userId']].redirect('game/?mode=unranked&room=' + result.room);
    savedResponses[result.a['userId']].send('game/?mode=unranked&playerid=playerone&room=' + result.room + '&playerunique=' + result.a['userId']);
    savedResponses[result.b['userId']].send('game/?mode=unranked&playerid=playertwo&room=' + result.room + '&playerunique=' + result.b['userId']);
    delete savedResponses[result.a['userId']];
    delete savedResponses[result.b['userId']];
});

module.exports = router;
