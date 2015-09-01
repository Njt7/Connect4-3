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

    $(".challenge").on('click', function() {
      var reciever = $(this).val();
      $.get("/challengesent?reciever="+reciever, function(challenger) {
        alert('You have now challenged: '+reciever );
        socket.emit('challenge', reciever, challenger);
        console.log('hello ajax');
      });
    });

    $(".accept").on('click', function() {
      $.post("/challengeaccepted?_id="+ $(this).attr('id'), function(challenger) {
        //socket.emit('challenge', reciever, challenger);

        console.log(challenger);
        window.location.replace(challenger);
      });
    });

    $(".decline").on('click', function() {
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
      $.get("/randomqueue", function(data) {
        window.location.href = data;
      });  
    });
  });