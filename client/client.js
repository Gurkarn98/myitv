// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  $.get('channels', function(page) {
    var channel = []
    
    var data = $(page).find("ul.sf-menu a")
    for (var i=0; i<data.length; i++){
      channel.push([$(data[i]).attr('href'), $(data)[i].innerHTML])
    }
  })
})
