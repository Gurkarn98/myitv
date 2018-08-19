var Tesseract = require('tesseract.js')
var request = require('request')
var fs = require('fs')
var jimp = require("jimp");
var filename = 'pic.png'
var m3u = 'tv_channels.m3u'
const http = require("http")
const url = require('url')
const cheerio = require('cheerio')
const htmlparser2 = require('htmlparser2');
const express = require('express')
const app = express();
const randomName = require('random-name')
const notifier = require('mail-notifier');
const requestIp = require('request-ip');
var schedule = require('node-schedule');
const endOfLine = require('os').EOL;
const domain = 'zippzapp.tk'

/* 
 *  APP MIDDLEWARE
 */

app.use(express.static('client'))
app.use(requestIp.mw())

/* 
 *  LOAD ENV VARIALBLES
 */

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

/* 
 *  TRIAL REQUEST SCHEDULE
 */

setInterval(function(){
  console.log(new Date())
}, 3600000)

var j = schedule.scheduleJob('27 30 19 * * *', function(){
  startFormSubmission()
  console.log('Form Submited at:', new Date());
});

var h = schedule.scheduleJob('13 30 12 * * *', function(){
  startFormSubmission()
  console.log('Form Submited at:', new Date());
});


/*
 *  SCRAP USER AGENTS
 */

function startFormSubmission(proxy) {
  var links = {
    chrome: "https://developers.whatismybrowser.com/useragents/explore/software_name/chrome/",
    explorer: "https://developers.whatismybrowser.com/useragents/explore/software_name/internet-explorer/0",
    android: "https://developers.whatismybrowser.com/useragents/explore/software_name/android-browser/",
    opera_mini: "https://developers.whatismybrowser.com/useragents/explore/software_name/opera-mini/",
    firefox: "https://developers.whatismybrowser.com/useragents/explore/software_name/firefox/",
    opera: "https://developers.whatismybrowser.com/useragents/explore/software_name/opera/",
    safari: "https://developers.whatismybrowser.com/useragents/explore/software_name/safari/"
  }
  var browsers = ["chrome", "explorer", "android", "opera_mini","firefox", "opera", "safari"]
  var randomL = Math.floor(Math.random()*7)
  request(links[browsers[randomL]], (error, response, body)=>{
    const dom = htmlparser2.parseDOM(body);
    const $ = cheerio.load(dom);
    var json = $(".useragent a").map(function() {
      return $(this).text();
    }).toArray();
    var randomU = Math.floor(Math.random()*json.length);
    var useragent = json[randomU]
    submitFormGlory(useragent);
  })

}

function submitFormGlory(useragent){
  console.log(useragent)
  request("https://api.getproxylist.com/proxy?allowsHttps=1&allowsPost=1&allowsCookies=1&maxSecondsToFirstByte=3&anonymity[]=high%20anonymity&lastTested=600&maxConnectTime=3&protocol[]=http", (err, response, body)=>{
    var person = generatePerson();
    var Body = JSON.parse(body);
    var proxy = "http://"+Body.ip+":"+Body.port
    if (!Body.error) {
      console.log(Body)
      var formLink = "https://actions.zotabox.com/form"
      var form = {
        "customer_id" : "323984",
        "data[Dropdown]" : "m3u",
        "data[MAG MAC Address ]" : "",
        "data[email]" : person.email,
        "data[name]" : person.name,
        "domain_id" : "414284",
        "domain_subscriber" : "https://glory-iptv.com/",
        "file_label" : "Attach file",
        "is_save_form_data" : "2",
        "is_subscribe" : "1",
        "is_term_of_service" : "0",
        "type" : "mailing",
        "widget_id" : "937692",
        "widget_name" : "FREE TRIAL FORM"
      }
      var options = {
        method: 'POST',
        url: 'https://actions.zotabox.com/contact/send',
        proxy: proxy,
        formData: 
        { code: 'contact_form_email',
          customer_id: '323984',
          data: '{"name":"'+person.name+'","email":"'+person.email+'","dropdown_0":"m3u\\n","text_field_1":"","url":"https://glory-iptv.com/","custom_field":[{"name":"Dropdown","value":"m3u\\n"}],"attach_file_label":"Attach file"}',
          domain_id: '414284',
          new_form: 'true',
          reply_to: person.name+' <'+person.email+'>',
          sender: person.name+' <mailer@zotabox.com>',
          subject: 'Free Trial Form',
          to: 'recipient_email',
          widget_id: '937692' 
        },
        headers : {
          "Accept": "*/*",
          "Origin": "https://glory-iptv.com",
          "Referer": "https://glory-iptv.com/",
          "User-Agent": useragent,
        }
      };
      request.post(options, (error, response, body)=>{
        console.log("POSTED")
        if (error) {
          console.log(error)
          submitFormGlory(useragent);
        } else {
          console.log("\n\n\n\n\n\n\n"+body+"\n\n\n\n\n\n\n")
          if(body) {
            try {
                a = JSON.parse(body);
                console.log("Submit", body)
                request.post({url:formLink, proxy:proxy ,form : form}, function (error, response, body) {
                  if (error) console.log(error);
                  console.log("Email", body);
                  console.log(person)
                });
            } catch(e) {
                submitFormGlory(useragent);
            }
          } else {
            console.log("No Body")
            submitFormGlory();
          }
        }
      })
    }
  })
}
/* 
 *  CAPTCHA DECODE
 */

function captchaCode(url, form){
  var writeFile = fs.createWriteStream(filename)
  request(url).pipe(writeFile).on('close', function() {
    jimp.read(filename, function (err, image) {
      if (err) throw err;
      image.resize(260, 100)
          .quality(100)
          .greyscale()
          .contrast(0.85)
          .write(filename, function(err){
            if (err) {console.log(err);}
            Tesseract.recognize(filename, {lang: 'eng', tessedit_char_blacklist: '`~!@#$%^&*()_-+=}]{[:;"\'|\\<,>.?/'})
              .progress(function  (p) { console.log('progress', p)  })
              .catch(err => console.error(err))
              .then(function (result) {
                var formOutput = generateForm(form);
                console.log(formOutput)
                formOutput['txtNumber'] = result.text.replace(/\n+/,"").replace(/\s+/, "").toUpperCase()
                var postOptions={
                  url: "https://www.123formbuilder.com/js-form--3060222.html",
                  form: formOutput,
                }
                request.post(postOptions, (err, response, body)=>{
                  const dom = htmlparser2.parseDOM(body);
                  const $ = cheerio.load(dom);
                  var json = $("form");
                  if (Object.keys(json)[0] === "0"){
                    console.log("Failure: " + formOutput["control33656033"] + " " + formOutput['txtNumber'])                   
                    extractform(body);
                  } else {
                    console.log("Successful: " + formOutput["control33656033"] )
                  }
                })
              })
          })
    }).catch(function (err) {
      console.error(err);
    });
  });
}

/* 
 *  CAPTCHA FORM GENERATOR
 */

function generateForm(result){
  var formOutput = result
  formOutput["control33656034"] = "6 Hours Full Package (Free)"
  formOutput["control33656037"] = "Canada",
  formOutput["temp_referer"] = "https://www.iptvservergate.com/iptvserver-freetest/"
  var person = generatePerson();
  formOutput["control33656033"] = person.email;
  formOutput["control33656032"] = person.name;
  delete formOutput.thisisjsform
  delete formOutput.new_embedding_system
  delete formOutput.undefined
  return formOutput
}

function generatePerson(){
  var name;
  var email;
  var randomN = Math.floor(Math.random()*2)
  if (randomN === 1){
    var first = randomName.first();
    var last = randomName.last();
    name = first+" "+last;
    var randomE = Math.floor(Math.random()*20)
    if (randomE === 0) {
      email = first+last+"@"+domain
    } else if (randomE === 1) {
      email = first+"."+last+"@"+domain
    } else if (randomE === 2) {
      email = first+"_"+last+"@"+domain
    } else if (randomE === 3) {
      email = last+first+"@"+domain
    } else if (randomE === 4) {
      email = last+"."+first+"@"+domain
    } else if (randomE === 5) {
      email = last+"_"+first+"@"+domain
    } else if (randomE === 6) {
      email = first+last[0]+"@"+domain
    } else if (randomE === 7) {
      email = last[0]+first+"@"+domain
    } else if (randomE === 8) {
      email = first+last+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 9) {
      email = last+first+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 10) {
      email = first+last+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 11) {
      email = last+first+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 12) {
      email = first+last+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 13) {
      email = last+first+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 14) {
      email = first+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 15) {
      email = last+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 16) {
      email = first+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 17) {
      email = last+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 18) {
      email = first+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 19) {
      email = last+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    }
  } else if (randomN === 0){
    var first = randomName.first();
    var last = randomName.last();
    var middle = randomName.middle();
    name = first+" "+middle+" "+last;
    var randomE = Math.floor(Math.random()*31)
    if (randomE === 0) {
      email = first+last+"@"+domain
    } else if (randomE === 0) {
      email = first+middle+last+"@"+domain
    } else if (randomE === 1) {
      email = first+middle[0]+last+"@"+domain
    } else if (randomE === 2) {
      email = first+"."+last+"@"+domain
    } else if (randomE === 3) {
      email = first+"_"+last+"@"+domain
    } else if (randomE === 4) {
      email = first+"."+middle+"."+last+"@"+domain
    } else if (randomE === 5) {
      email = first+"."+middle[0]+"."+last+"@"+domain
    } else if (randomE === 6) {
      email = first+"_"+middle+"_"+last+"@"+domain
    } else if (randomE === 7) {
      email = first+"_"+middle[0]+"_"+last+"@"+domain
    } else if (randomE === 8) {
      email = last+first+"@"+domain
    } else if (randomE === 9) {
      email = last+middle+first+"@"+domain
    } else if (randomE === 10) {
      email = last+middle[0]+first+"@"+domain
    } else if (randomE === 11) {
      email = last+"."+middle+"."+first+"@"+domain
    } else if (randomE === 12) {
      email = last+"_"+middle+"_"+first+"@"+domain
    } else if (randomE === 13) {
      email = last+"_"+middle[0]+"_"+first+"@"+domain
    } else if (randomE === 14) {
      email = last+"."+middle[0]+"."+first+"@"+domain
    } else if (randomE === 15) {
      email = last+"."+first+"@"+domain
    } else if (randomE === 16) {
      email = last+"_"+first+"@"+domain
    } else if (randomE === 17) {
      email = first+last[0]+"@"+domain
    } else if (randomE === 18) {
      email = last[0]+first+"@"+domain
    } else if (randomE === 19) {
      email = first+last+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 20) {
      email = last+first+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 21) {
      email = first+last+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 22) {
      email = last+first+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 23) {
      email = first+last+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 24) {
      email = last+first+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 25) {
      email = first+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 26) {
      email = last+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 27) {
      email = first+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 28) {
      email = last+"."+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 29) {
      email = first+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    } else if (randomE === 30) {
      email = last+"_"+Math.floor((Math.random()*99)+1)+"@"+domain
    }
  }
  var value = {
    name : name,
    email : email
  }
  return value
}

/* 
 *  FORM SUBMISSION STARTER
 */

function submitFormServerGate() {
  var getOptions = {
    url: "http://www.123formbuilder.com/js-form-username-3060222.html?ref=https%3A%2F%2Fwww.iptvservergate.com%2Fiptvserver-freetest%2F&_referrer_=&_embedType_=embed.js&_iframeID_=1530566387572_5580292922352",
    method: "GET"
  }
  request(getOptions, (err, response, body)=>{
    response.setEncoding("utf8")
    extractform(body)
  })
}

/* 
 *  FORM EXTRACTOR
 */

function extractform(body){
  const dom = htmlparser2.parseDOM(body);
  const $ = cheerio.load(dom);
  var json = $("input");
  var result = {};
  for (var i = 0; i<Object.keys(json).length; i++) {
    var parsed = null;
    if (json[Object.keys(json)[i]].name === "input") {
      result[json[Object.keys(json)[i]].attribs.name] = json[Object.keys(json)[i]].attribs.value||""
    }
  }
  var image = $("img");
  var captchaFound = false;
  for (var i = 0; i<Object.keys(image).length; i++) {
    var parsed = null;
    if (image[Object.keys(image)[i]].name === "img"){
      if (image[Object.keys(image)[i]].attribs.alt === "verification image") {
        captchaFound = true;
        var url = image[Object.keys(image)[i]].attribs.src
        captchaCode(url, result);
      }
    } else {
      if (i === Object.keys(image).length-1 && captchaFound === false){
        //console.log("else")
        console.log(result)
        var formOutput = generateForm(result);
        var postOptions={
          url: "https://www.123formbuilder.com/js-form--3060222.html",
          form: formOutput,
        }
        request.post(postOptions, (err, response, body)=>{
          const dom = htmlparser2.parseDOM(body);
          const $ = cheerio.load(dom);
          var json = $("form");
          if (Object.keys(json)[0]){
            extractform(body);
          } else {
            console.log("Successful: " + formOutput["control33656033"] )
          }
        })
      }
    } 
  }
}

/* 
 *  MAIL LISTNER
 */

var imap = {
  user: process.env.EMAIL,
  password: process.env.OTP,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};
const n = notifier(imap);
n.on('end', () => n.start()).on('mail',function(mail){
  console.log(mail.subject)
if (mail.subject === "Re: Gate Android trial 6 Hours Full Package (Free)" && mail.from[0].address === "iptv.subscription7@gmail.com") {
    const dom = htmlparser2.parseDOM(mail.html);
    const $ = cheerio.load(dom);
    var json = $("b a");
    if (Object.keys(json)[0] === "0") {
      var url = (json[0].attribs.href).replace(/&amp;/g, "&")
      console.log("URL :", url)
      http.get(url, function (response){
        response.setEncoding("utf8");
        var body=""
        response.on('data', data=>{body+=data})
        response.on("end", ()=>{
          if (body!==""){
            fs.writeFile("tv_channels.m3u", body, (err)=>{if (err) throw err})
          }
        })
      })
    }
  }
  if (mail.subject === "Re: Free Trial Form") {
    const dom = htmlparser2.parseDOM(mail.html);
    const $ = cheerio.load(dom);
    var json = $("div a");
    console.log(json)
    fs.writeFile("json.txt", json, (err)=>{if (err) throw err})
    if (json.length>0 && json[0].name === "a"){
      var url = json[0].attribs.href.replace(/&amp;/g, "&")  
      console.log("URL :", url)
      request(url, function (error, response, playlist){
        if (playlist!==""){
          playlist = playlist.split("#EXTINF:")
          playlist = playlist.filter(item=>{
            if (item.match(/group-title="India"/gi)){
              return item
            } else if (item.match(/group-title="Italy"/gi)){
              return item
            } else if (item.match(/group-title="Canada"/gi)){
              return item
            } else if (item.match(/group-title="United States"/gi)){
              return item
            } else if (item.match(/group-title="United Kingdom"/gi)){
              return item
            } else if (item.match(/group-title="Sports"/gi)){
              return item
            } else if (item.match(/group-title="Sport VIP"/gi)){
              return item
            } else {}
          })
          console.log(playlist.length)
          playlist=playlist.join("#EXTINF:")
          playlist="#EXTM3U\n#EXTINF:"+playlist
          fs.writeFile(m3u, playlist, (err)=>{if (err) throw err})
        }
      })
    }
  }
}).start();
/* 
 *  ROUTE GET CHANNELS
 */

app.get("/tv_channels", (request, response) => {
  response.sendFile(__dirname + '/tv_channels.m3u')
})

/*
 *  API ROUTES
 */

app.get("/channels", (request, res) => {
  http.get("http://www.desi-serials.tv/", function (response){
    response.setEncoding("utf8");
    var body=""
    response.on('data', data=>{body+=data})
    response.on("end", ()=>{res.send(body)})
  })
})

app.get("/proxy", (request, res)=>{
  console.log("ip : \n",request.clientIp)
  res.send(request.headers)
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

/* 
 *  ROUTE EVERYTHING NOT DEFINED TO HOMEPAGE
 */

app.get("/*", (request, response) => {
  response.sendFile(__dirname + '/client/index.html')
})

/* 
 *  SERVER START
 */

const listener = app.listen(80, () => {
    console.log(`Your app is listening on port ${listener.address().port} ${new Date()}`)
})