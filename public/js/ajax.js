function deselect(e) {
    $(".pop").slideFadeToggle(function() {
      e.removeClass("selected");
    });    
  }
  $(function() {
    $("#contact").on('click', function() {
      if($(this).hasClass("selected")) {
        deselect($(this));               
      } else {
        $(this).addClass("selected");
        $.get("/string", function(string) {
            alert(string)
        });
        $(".pop").slideFadeToggle();
        };
        return false;
      });

      $(".close").on('click', function() {
          deselect($(this));
          return false;
      });
  });

  $.fn.slideFadeToggle = function(easing, callback) {
    return this.animate({ opacity: 'toggle', height: 'toggle' }, "fast", easing, callback);
  };

  $(document).ready(function(){
    $("#notUser").on('click', function() {
      $.get("/notuser", function(string) {
        alert(string)
      });
    });
    $("#notUser2").on('click', function() {
      $.get("/notuser", function(string) {
        alert(string)
      });
    });

    $(".challenge").on('click', function() {
      var reciever = $(this).val();
      $.get("/challengesent?reciever="+reciever, function(challenger) {
        alert('You have now challenged: '+reciever );
        socket.emit('challenge', reciever, challenger);
        console.log('hello ajax');
      });
    });

    $(".accept").on('click', function(obj) {
      var reciever = $(this).parent().attr('reciever');
      var challenger = $(this).parent().attr('challenger');
      socket.emit('accChall', 'test', reciever, challenger);
      $.post("/challengeaccepted?_id="+ $(this).attr('id'), function(gameUrl) {
        //socket.emit('challenge', reciever, challenger);
        window.location.replace(gameUrl);
      });
    });

    $(".decline").on('click', function(obj) {

      $.post("/challengedeclined?_id="+ $(this).attr('id')), function(challenger) {
        //Removes database object on server
      };
      $(this).parent().remove();
    });

//http://localhost:3000/game?mode=challenge&playerid=playerone&room=thisisanameteoteo&playerunique=55a8f01ae9f1cb94164be9fb&matchid=55d590a03c57c88c1c2b6847
    $(".match").on('click', function() {
      var urlString = '/game?matchid=' 
                    + $(this).attr('name')
                    + '&mode=challenge'
                    + '&playerid='
                    + $(this).attr('playerid')
                    + '&playerunique='
                    +  $(this).attr('playerunique')
                    + '&room='
                    + $(this).attr('playeroneid')
                    + $(this).attr('playertwoid');
      window.location.replace(urlString);
    });


    $("#randomQueue").on('click', function() {
      queue();
      /*
      $.get("/randomqueue", function(data) {
        window.location.href = data;
      */
      });
      
  });

function dialogRecievedChal(challengerName) {
    $("#parag").html(challengerName + ' have challenged you!');
    $( "#dialog" ).dialog({
      resizable: false,
      draggable: false,
      height:200,
      width:320,
      modal: true,
      buttons: {
        "Go to challenges": function() {
          $( this ).dialog( "close" );
          window.location.replace('/yourChallenges');
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
});
    $(".ui-dialog-titlebar").hide();
};

function dialogAcceptedChal(accepterName) {
    $("#parag").html(accepterName + ' accepted your challenge!');
    $( "#dialog" ).dialog({
      resizable: false,
      draggable: false,
      height:200,
      width:320,
      modal: true,
      buttons: {
        "Go to matches": function() {
          $( this ).dialog( "close" );
          window.location.replace('/matches');
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
});
    $(".ui-dialog-titlebar").hide();
};

/*
//Initialize dialog
$("#dialog").dialog({
    autoOpen: false,
    show: {
        effect: "blind",
        duration: 1
    },
    hide: {
    }
});

//Open it when #opener is clicked
$("#opener").click(function () {
    $("#dialog").dialog("open");
});

//When the button in the form is clicked, take the input value and set that as the value of `.myTarget`
$('.formSaver').on('click', function () {
    $('.myTarget').text($('.myInput').val());
    $("#dialog").dialog('close');
});
*/