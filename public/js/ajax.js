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
        })
        $(".pop").slideFadeToggle();
        }
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
          })
      });

    $("#randomQueue").on('click', function() {
          $.get("/randomqueue", function(data) {
            window.location.href = data;
          })
      });
    });