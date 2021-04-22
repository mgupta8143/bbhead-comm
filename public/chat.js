function findScoreLength(score2) {
  let i = 0;
  while(i < score2.length && score2[i] !== "") {
    i+= 1
  }
  return i;
}


$(function () {      
    $('.room-list').css("height",  $(window).outerHeight() -  $('#bbheadnav').outerHeight());
    $('.chat-wrapper').css("width",  $("body").prop("scrollWidth") - $('.room-wrapper').outerWidth());
    $('#messages').css("height", $(window).outerHeight() -  ($('#bbheadnav').outerHeight() + $("#scoreboard").outerHeight() + $("#chat-form").outerHeight() + 10));
    $('#team1spacer').css("padding-left", )
    $(window).on('resize', function(){
       $('.room-list').css("height",  $(window).outerHeight() -  $('#bbheadnav').outerHeight());
       $('.chat-wrapper').css("width",  $("body").prop("scrollWidth") - $('.room-wrapper').outerWidth());
       $('#messages').css("height", $(window).outerHeight() -  ($('#bbheadnav').outerHeight() + $("#scoreboard").outerHeight() + $("#chat-form").outerHeight() + 10));
    });
    $('#register-btn').click(()=> {
      $('#register-modal').css("display", "block");
    });
    $('.close').click(()=> {
      $('#register-modal').css("display", "none");
    });

    var socket = io();

    //var whichRoom = $('#firstRoom').text();
    //console.log(whichRoom);
    //socket.emit('room change', whichRoom);

    $('.room').click(function(){
      let team1 = $(this).find("p.team1text").text();
      let team2 = $(this).find("p.team2text").text();
      socket.emit('room change', team1, team2);
      $(".room").css("border-bottom", "");
      $(this).css("border-bottom", "8px solid green");


    }); 


    $('form').submit(function(e) {
      let usernameString = $('#username-link').text();
      let username = usernameString.substring(usernameString.indexOf(",") + 2, usernameString.length -1);
      if(username === "") {
        username = "Guest";
      }
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val(), username);
      $('#m').val('');
      return false;
    });

    socket.on('chat message', function(date, msg, username, color){
        console.log(color);
        let localDate = new Date(date.toLocaleString()).toLocaleTimeString();
        var chatElement = $("<li id = 'chat'>").text(msg);
        var dateElement = $("<p id = 'datetime'>").text(localDate);
        var usernameElement = $("<p id = 'username'>").text(username);
        $('#messages').append(dateElement);
        $('#messages').append(usernameElement);
        $('#messages').append(chatElement);
        $('#messages').append($('<br>'))
    });

    socket.on('room change', function(chat) {
        $('#messages').css('opacity', 0);
        $('.spinner').css('opacity', 1);
        $('#messages').empty();
        $('.spinner').css('opacity', 0);
        $('#messages').css('opacity', 1);
        for(let i = 0; i < chat.length; i++) {
          let localDate = new Date(chat[i].date.toLocaleString()).toLocaleTimeString();
          var chatElement = $("<li id = 'chat'>").text(chat[i].msg);
          var dateElement = $("<p id = 'datetime'>").text(localDate);
          var usernameElement = $("<p id = 'username'>").text(chat[i].username);
          $('#messages').append(dateElement);
          $('#messages').append(usernameElement);
          $('#messages').append(chatElement);
          $('#messages').append($('<br>'));
        }
    })


    socket.on('score change', function(liveGameInfo) {
      $.each($(".room"), function(idx, val) {
        let team1 = $(this).find("p.team1text").text();
        let team2 = $(this).find("p.team2text").text();
        for(let i = 0; i < liveGameInfo.length; i++){
          if(liveGameInfo[i].team1 === team1 && liveGameInfo[i].team2 === team2) {
            let scoreLength = findScoreLength(liveGameInfo[i].team2Scores);
            for(let j = 0; j < scoreLength; j++) {
              if(j == scoreLength - 1) {
                $(this).find("#1total").text(liveGameInfo[i].team1Scores[j]);
                $(this).find("#2total").text(liveGameInfo[i].team2Scores[j]);
              }
              else {
              $(this).find("#1" + j.toString()).text(liveGameInfo[i].team1Scores[j]);
              $(this).find("#2" + j.toString()).text(liveGameInfo[i].team2Scores[j]);
              }

            }
          }
        }
      })
      //loop through each room and see if both teams match

    });
});