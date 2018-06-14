const express = require('express')
const app = express()
const http = require('http')
const url = require("url");

app.use(express.static('client'))

app.get("/channels", (request, res) => {
  http.get("http://www.desi-serials.tv/", function (response){
    response.setEncoding("utf8");
    var body=""
    response.on('data', data=>{body+=data})
    response.on("end", ()=>{res.send(body)})
  })
})

app.get("/providers", (request, res) => {
  var providerLinks = [/*"http://www.desi-tashann.tv/","http://apnetv.tv/",*/ "http://www.desirulez.cc/tv-shows.html", "http://www.desiplex.cc/"]
  var providerNames = [/*"desitashann","apnetv",*/ "desirulez", "desiplex"]
  var temp = []
  var body = {
    desitashann: "",
    apnetv: "",
    desirulez: "",
    desiplex: ""
  }
  var counter = 0;
  for (var i = 0; i<providerLinks.length; i++){
    getData(i)
  }
  function getData (i){
    http.get(providerLinks[i], function (response){
      var newData=""
      response.setEncoding("utf8")
      response.on("data", data=>{body[providerNames[i]]+=data})
      response.on('end', ()=>{
        counter++
        if (counter === providerLinks.length){
          res.send(body)
        }
      })
    })
  }
})

app.get("/episodes", (req, res) => {
  var links = JSON.parse(req.query.links)
  var temp = []
  var body = {
    desitashann: "",
    apnetv: "",
    desirulez: "",
    desiplex: "",
    desiserial: ""
  }
  var counter = 0;
  for (var i = 0; i<links.length; i++){
    getData(i)
  }
  function getData (i){
    if (links[i][1] !== "" && links[i][1] !== undefined && url.parse(links[i][1]).host){
      http.get(links[i][1], function (response){
        var newData=""
        response.setEncoding("utf8")
        response.on("data", data=>{body[links[i][0]]+=data})
        response.on('end', ()=>{
          counter++
          if (counter === links.length){
            res.send(body)
          }
        })
      })
    } else {
      counter++;
      if (counter === links.length){
        res.send(body)
      }
    }
  }
})
app.get("/nextpage", (req, res) => {
  var links = JSON.parse(req.query.links)
  var temp = []
  var body = {
    desitashann: "",
    desirulez: "",
    desiplex: "",
    desiserial: ""
  }
  var counter = 0;
  for (var i = 0; i<links.length; i++){
    getData(i)
  }
  function getData (i){
    if (links[i][1] !== "" && links[i][1] !== undefined && url.parse(links[i][1]).host){
      http.get(links[i][1], function (response){
        var newData=""
        response.setEncoding("utf8")
        response.on("data", data=>{body[links[i][0]]+=data})
        response.on('end', ()=>{
          counter++
          if (counter === links.length){
            res.send(body)
          }
        })
      })
    } else {
      counter++;
      if (counter === links.length){
        res.send(body)
      }
    }
  }
})
app.get("/getlinks", (req, res) => {
  var links = JSON.parse(req.query.episode).link
  var temp = []
  var body = {
    desitashann: "",
    desirulez: "",
    desiplex: "",
    desiserial: ""
  }
  var counter = 0;
  for (var i = 0; i<links.length; i++){
    getData(i)
  }
  function getData (i){
    if (links[i][1] !== "" && links[i][1] !== undefined && url.parse(links[i][1]).host){
      http.get(links[i][1], function (response){
        var newData=""
        response.setEncoding("utf8")
        response.on("data", data=>{body[links[i][0]]+=data})
        response.on('end', ()=>{
          counter++
          if (counter === links.length){
            res.send(body)
          }
        })
      })
    } else {
      counter++;
      if (counter === links.length){
        res.send(body)
      }
    }
  }
})
app.get("/getVideo", (req, res) => {
  var link = JSON.parse(req.query.video)
  console.log(link)
  http.get(link.link, function (response){
    response.setEncoding("utf8");
    var body={
      provider: link.provider,
      data: "",
      source: link.source
    }
    response.on('data', data=>{body.data+=data})
    response.on("end", ()=>{res.send(body)})
  })
})

app.get("/*", (request, response) => {
  response.sendFile(__dirname + '/client/index.html')
})

const listener = app.listen(8080, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
