// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  $("#submit").on("click", ()=>{
    var form={
      "device": "Kodi",
      "mac_address": "Kodi",
      "quantity": "1",
      "add_to_cart": "81"
    }
    $.ajax({
      url:"https://iptvsubs.is/product/trial",
      method:"POST",
      data:form,
      beforeSend: function(xhrObj){
        xhrObj.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhrObj.setRequestHeader("Accept","text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
        xhrObj.setRequestHeader("Accept-Encoding","gzip, deflate, br");
        xhrObj.setRequestHeader("Accept-Language","n-US,en;q=0.9,it-IT;q=0.8,it;q=0.7");
        xhrObj.setRequestHeader("Upgrade-Insecure-Requests", "1");
        xhrObj.setRequestHeader("Origin", "null");
      },
      success:(data)=>{
        console.log(data)
      }
    })    
  })
})
