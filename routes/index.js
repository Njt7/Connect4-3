var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var Challenge = require('../models/challenge');
var Match = require('../models/match');
var HistoryMatch = require('../models/history');
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
    console.log(req.session);
    console.log('LETS SEE IF THE QUERY WORKS '+ req.query.matchid)
    if(req.query.matchid){
        Match.findById(req.query.matchid, function(err, dbMatch){
            console.log('THIS BE THE GAME' + dbMatch);
            res.render('game', { match: dbMatch, user: req.user });
        });
    }
    else{
        res.render('game', { user : req.user });
    }
});

router.get('/hotseat', function(req, res) {
  var string = encodeURIComponent('hotseat');
  res.redirect('game/?room=' + string );
});


router.get('/contact', function(req, res) {
    res.send({ some: 'json' });
});

router.get('/matches', function(req, res) {
    Match.find( {$or : [{playerOneId: req.user.username}, {playerTwoId: req.user.username}]}, function(err, matches){
        console.log('THIS BE MATCHES' + matches);
        res.render('matches', { dbdata: matches, user: req.user });
    });
});

router.get('/history', function(req, res) {
    HistoryMatch.find( {$or : [{playerOneId: req.user.username}, {playerTwoId: req.user.username}]}, function(err, histories){
        console.log('Histories: ' + histories);
        res.render('history', { dbdata: histories, user: req.user });
    });
});

router.get('/about', function(req, res) {
    res.render('about');
});




//Idiotic way of removing all matches to start from scratch

router.get('/removematches', function(req, res) {
    Match.remove({}, function(err, matches){
        res.render('matches', { dbdata: matches });
    });
});

router.get('/removehistory', function(req, res) {
    HistoryMatch.remove({}, function(err, histories){
        res.render('history', { dbdata: histories });
    });
});


router.get('/sendchallenge', function(req, res) {
    //Only find and return logged in users
    Account.find( {username : {$ne: req.user.username}}, function(err, users) {


        res.render('sendchallenge', {accs : users, user: req.user } )
    });
});

router.get('/search', function(req, res) {
    //Only find and return logged in users
    if(req.query.search.length > 0){
        Account.find({ username:req.query.search }, function(err, foundUser) {

            res.render('sendchallenge', {accs : foundUser, user: req.user } )
        });    
    }
});

router.get('/yourchallenges', function(req, res) {
   Challenge.find({ reciever: req.user.username }, function(err, challenges) {
        if (err) return console.error(err);
        console.log(challenges);
        
        //console.log('hi testing for challenges: %s', challenges);
        res.render('yourchallenges', { user : req.user, dbdata:challenges });
        })
});


router.get('/challengesent', function(req, res) {
    //Sending usernameback for a completed challenge
    res.send(req.user.username);
});

router.post('/challengeaccepted', function(req, res) {
    //Sending usernameback for a completed challenge

    Challenge.findOne({_id: req.query._id}, function(err, chall){
         if (err) return console.error(err);
        //createMatchFromChallenge = chall;
        var match = new Match({ playerOneId: chall.challenger, playerTwoId: chall.reciever, gameType:'vsPlayer', gameState:'waiting' });
            
        match.save(function (err, savedMatch) {
            if (err) return console.error(err);
                console.log('this should be my saved match:' +savedMatch);

                Challenge.remove({ _id: req.query._id }, function(err, deletedChallenge) {
                    if (err) return console.error(err);
                });
            //http://localhost:3000/game/?mode=unranked&playerid=playerone&room=eIaiF4E8v9&playerunique=55a8f01ae9f1cb94164be9fb
            res.send('game?mode=challenge&playerid=playertwo&room=' + match.playerOneId + match.playerTwoId+'&playerunique='+req.user._id + '&matchid='+match._id);   
        });
    });
});

router.post('/challengedeclined', function(req, res) {
    //Sending usernameback for a completed challenge

    Challenge.remove({ _id: req.query._id }, function(err, challenges) {
        if (err) return console.error(err);
    }); 
    res.send();
});

/*
tror att denna inte används bort kommenterad för test, kan deletas ifall inget annat går sönder
router.get('/challengeAccepted', function(req, res) {
    //Sending usernameback for a completed challenge
    res.send(req.user.username);
});
*/

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
    /*
    if(savedResponses[req.user.username]){
      console.log('this already exists');
      return;  
    }

    savedResponses[req.user.username] = res;

    console.log('saved Responeses %s', savedResponses[req.user.username]);
    matchListener.enterRandomQueue(req.user.username);
    */

    //var string = encodeURIComponent('hotseat');
    //res.redirect('game/?room=' + string);
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

//Events
matchListener.on('match', function(result) {
    /*
    console.log('HERE WE MIGHT HAVE A FAILURE');
    console.log(result.a);
    console.log(result.b);
    var match = new Match({ playerOneId: result.a['userId'], playerTwoId: result.b['userId'], gameType:'randomQueue', gameState:'waiting' });
            
        match.save(function (err, savedMatch) {
            if (err) return console.error(err);
            console.log('this should be my saved match:' +savedMatch);
            savedResponses[result.a['userId']].send('game/?mode=unranked&playerid=playerone&room=' + result.room + '&playerunique=' + result.a['userId'] + '&matchid=' + savedMatch._id);
            savedResponses[result.b['userId']].send('game/?mode=unranked&playerid=playertwo&room=' + result.room + '&playerunique=' + result.b['userId'] + '&matchid=' + savedMatch._id);
            delete savedResponses[result.a['userId']];
            delete savedResponses[result.b['userId']];
        });
    /*
    //Redirecting saved responses to a unique response
    //savedResponses[result.a['userId']].redirect('game/?mode=unranked&room=' + result.room);
    //savedResponses[result.b['userId']].redirect('game/?mode=unranked&room=' + result.room);
    savedResponses[result.a['userId']].send('game/?mode=unranked&playerid=playerone&room=' + result.room + '&playerunique=' + result.a['userId']);
    savedResponses[result.b['userId']].send('game/?mode=unranked&playerid=playertwo&room=' + result.room + '&playerunique=' + result.b['userId']);
    delete savedResponses[result.a['userId']];
    delete savedResponses[result.b['userId']];
    */
    console.log('hi');
});

module.exports = router;
