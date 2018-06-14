angular.
  module('app')
  .factory('channelService', function ($http, $window){
    var channelService = {
      channelList: undefined,
      channels : undefined,
      show: undefined,
      episodeList: undefined,
      episode: undefined,
      links: undefined,
      video:undefined,
      error:undefined,
      selectedSource:undefined,
      channel : function(){
        return $http.get('channels')
      },
      providers: function(){
        return $http.get("providers")
      },
      episodes: function(show){
        return $http({method: 'GET', url:"episodes", params:{links: JSON.stringify(show.link)}})
      },
      getNextPage: function(link){
        return $http({method: 'GET', url:"nextpage", params:{links: JSON.stringify(link)}})
      },
      getLinks: function(episode){
        return $http({method: 'GET', url:"getlinks", params:{episode: JSON.stringify(episode)}})
      },
      getVideo: function(episode){
        return $http({method: 'GET', url:"getVideo", params:{video: JSON.stringify(episode)}})
      },
      parseChannels : function(res) {
        var page = res.data
        page = page.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        var re = /<ul class="tabs">.*?<\/ul>/g
        var reSplit = /<img src=".*?" alt=".*?" width="30px" height="35px" (alt=".*?")*style="position:absolute;padding:6px"\/>.*?<\/li>/g
        var groups = page.match(re)[0]
        groups = groups.match(reSplit)
        groups = groups.map(group=>{
          var reName = /<li id="tabz([0-9]+)"( class="current")*>(.*?)<\/li>/
          var name = group.match(reName)
          var reLogo = /<img src="(.*?)" alt=".*?" width="30px" height="35px" (alt=".*?")*style="position:absolute;padding:6px"\/>/
          var logo = group.match(reLogo);
          var number= name[1]
          var reShows= new RegExp('<div id="contentz' + number + '" class="tabscontent">'+'(.*?)<\/div', 'g')
          var shows = page.match(reShows)[0];
          var reShowsSplit = /<li class="cat-item cat-item-([0-9]+)">(.*?)<\/li>/g
          shows = shows.match(reShowsSplit)
          var reShowDetails = /<a href="(.*?)"\s*>(.*?)<\/a>/
          shows = shows.map(show=>{
              var showName = show.match(reShowDetails)[2]
              var showLink = show.match(reShowDetails)[1]
              var edit = {
                name:showName.replace(/&amp;/g, "&").replace(/&#8211;/g, "-").replace(/&#039;/g, '\''),
                link:showLink
              }
              return edit
            })
          var list = {
            channel : {
              name: name[3],
              logo: "http://www.desi-serials.tv"+logo[1]
            },
            shows: shows
          }
          return list
        })
        var channels = groups
        channelService.channelList = groups
        channelService.providers().then(res=>channelService.parseProviders(res, channels))
      },
      parseProviders : function(res, channels) {
        var desirulez = res.data.desirulez;
        desirulez = desirulez.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        desirulez = desirulez.match(/<a href=".*?">(.*?)<\/a>/g)
        var desitashann = res.data.desitashann
        //desitashann = desitashann.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        //desitashann = desitashann.match(/<a href=".*?">(.*?)<\/a>/g)
        var desiplex = res.data.desiplex
        desiplex = desiplex.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        desiplex = desiplex.match(/<a href=".*?" >(.*?)<\/a>/g)
        channels.map(channel=>{
          var edit = channel
          edit.shows.map(show=>{
            show.name==='Savitri Devi College And Hospital'?show.name='Savitri Devi':show.name
            show.name==='Bhabi Ji Ghar Par Hain'?show.name='Bhabi Ji Ghar Pe Hai':show.name
            var name = (show.name.replace(/\W/g, ".").replace(/(.)\1/gi, "$1").split("").join('+.?').replace(/\.\+/g, '.{0,5}').replace(/v/g, "[wv]")).replace(/o/gi, "[uo]").replace(/e/gi, "[ei]").replace(/e[eyi]/gi, "e?y?i?").replace(/i\+/gi, "e?i?")
            var reShowLink = new RegExp('<a href=".*?"( )?(.)*?( )*?>(<b>)*'+name+'.*?'+'(<\/b>)*<\/a>', "gi")
            var desirulezLink = desirulez.filter(show=> {return reShowLink.test(show)})
            var desiplexLink = desiplex.filter(show=> {return reShowLink.test(show)})
            //var desitashannLink = desitashann.filter(show=> {return reShowLink.test(show)})
            desirulezLink[0]?desirulezLink=desirulezLink[0].match(/<a href="(.*?)">.*?<\/a>/)[1]:desirulezLink=""
            desiplexLink[0]?desiplexLink=desiplexLink[0].match(/<a href="(.*?)" >.*?<\/a>/)[1]:desiplexLink=""
            //desitashannLink[0]?desitashannLink=desitashannLink[0].match(/<a href="(.*?)" target="_blank" rel="noopener ?n?o?r?e?f?e?r?r?e?r?">.*?<\/a>/)[1]:desitashannLink=""
            show.link= [['desiserial', show.link], ['desiplex', desiplexLink], /*['desitashann', desitashannLink],*/ ['desirulez', desirulezLink], ['desirulez', desirulezLink.replace(/\.html\?s=/i, '-2.html?s=')]]
            show.name==='Savitri Devi'?show.name='Savitri Devi College And Hospital':show.name
            show.name==='Bhabi Ji Ghar Pe Hai'?show.name='Bhabi Ji Ghar Par Hain':show.name
            return show
          })
          return edit 
        })
        channelService.channels = channels
      },
      parseEpisodes : function(res){
        var desirulez = res.data.desirulez;
        var desitashann = res.data.desitashann
        var desiplex = res.data.desiplex
        var desiserial = res.data.desiserial
        var name = (channelService.show.name
                    .replace(/\W/g, ".")
                    .replace(/(.)\1/gi, "$1")
                    .split("").join('+.?')
                    .replace(/\.\+/g, '.{0,5}')
                    .replace(/v/g, "[wv]"))
        .replace(/o/gi, "[uo]")
        .replace(/e/gi, "[ei]")
        .replace(/e[eyi]/gi, "e?y?i?")
        .replace(/i\+/gi, "e?i?")
        var reDesiserial = new RegExp('<a href=".*?">.*?</a>', 'gi')
        var reDesiserialFilter = new RegExp('<a href=".*?">'+name+' [1-3]?[0-9][snrt][tdh] (january)?(february)?(march)?(april)?(may)?(june)?(july)?(august)?(september)?(october)?(november)?(december)? 20[0-9]{2}'+' Watch Online Episode HD</a>', 'i')
        var reDesiserialLink=/<a href="(.*?)">.*?<\/a>/i
        var reDesiserialDate= /[1-3]?[0-9][snrt][tdh] (january)?(february)?(march)?(april)?(may)?(june)?(july)?(august)?(september)?(october)?(november)?(december)? 20[0-9]{2}/i
        var reDesirulezGroup = new RegExp('<li class="threadbit (hot)?" id="thread_[0-9]*">.*?</li>', 'gi')
        var reDesiplexGroup = /<div class="column half">.*?<\/article><\/div>/gi
        desiserial = desiserial.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        desiserial = desiserial.match(/<div class="eleven columns top bottom">(.*?)<\/ul><\/div>/g)[0]
        desiserial = desiserial.match(reDesiserial)
        desiserial = desiserial.filter(link=>{return reDesiserialFilter.test(link)})
        desiserial = desiserial.map(link=>{return {date: link.match(reDesiserialDate)[0],link:[['desiserial', link.match(reDesiserialLink)[1]]]}})
        desirulez = desirulez.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        if (desirulez && desirulez !== ""){
          desirulez = desirulez.match(/<div class="forumbits">(.*?)<\/form><\/div>/g).join('')
          desirulez = desirulez.match(reDesirulezGroup)
        }
        //desitashann = desitashann.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        //desitashann = desitashann.match(/<a href=".*?">(.*?)<\/a>/g)
        desiplex = desiplex.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        if (desiplex && desiplex!==""){
          desiplex = desiplex.match(/<div class="col-8 main-content">.*?<\/a><\/div><\/div>/gi)[0]
          desiplex = desiplex.match(reDesiplexGroup)
        }
        desiserial.map((episode, i)=>{
          console.log("146", channelService.show.name)
          channelService.show.name==='Savitri Devi College And Hospital'?channelService.show.name='Savitri Devi':channelService.show.name
          channelService.show.name=='Savitri Devi'?channelService.show.name='Savitri Devi College & Hospital':channelService.show.name
          channelService.show.name==='Bhabi Ji Ghar Par Hain'?channelService.show.name='Bhabhiji Ghar Pe Hai':channelService.show.name
          channelService.show.name==='Bhabi Ji Ghar Par Hai'?channelService.show.name='Bhabhiji Ghar Pe Hai':channelService.show.name
          var name = (channelService.show.name
                      .replace(/\W/g, ".")
                      .replace(/(.)\1/gi, "$1")
                      .split("").join('+.?')
                      .replace(/\.\+/g, '.{0,5}')
                      .replace(/v/g, "[wv]"))
          .replace(/o/gi, "[uo]")
          .replace(/e/gi, "[ei]")
          .replace(/e[eyi]/gi, "e?y?i?")
          .replace(/i\+/gi, "e?i?")
          var reDesirulezFilter = new RegExp('<a class="title" href=".*?" id="thread_title_[0-9]*">'+name+' '+episode.date+' Watch Online</a>', 'gi')
          var reDesirulezLink = new RegExp('<a class="title" href="(.*?)" id="thread_title_[0-9]*">.*?</a>', 'i')
          console.log(reDesirulezFilter)
          if (desirulez && desirulez !== ""){
            var newLinkrulez = desirulez.filter(link=>{return reDesirulezFilter.test(link)})
          }          
          channelService.show.name==='Savitri Devi College & Hospital'?channelService.show.name='Savitri Devi':channelService.show.name
          channelService.show.name==='Bhabhiji Ghar Pe Hai'?channelService.show.name='Bhabi Ji Ghar Par Hai':channelService.show.name
          console.log("167", channelService.show.name)
          var name = (channelService.show.name
                      .replace(/\W/g, ".")
                      .replace(/(.)\1/gi, "$1")
                      .split("").join('+.?')
                      .replace(/\.\+/g, '.{0,5}')
                      .replace(/v/g, "[wv]"))
          .replace(/o/gi, "[uo]")
          .replace(/e/gi, "[ei]")
          .replace(/e[eyi]/gi, "e?y?i?")
          .replace(/i\+/gi, "e?i?")
          var reDesiplexLink = new RegExp('<a href=".*?">.*?</a></span><a href="(.*?)" title=".*?" itemprop="url">.*?</a>', 'i')
          var reDesiplexFilter = new RegExp('<a href=".*?" title=".*?" itemprop="url">'+name+' '+episode.date+' Watch Online</a>', 'gi')
          if (desiplex && desiplex!==""){
            var newLinkplex = desiplex.filter(link=>{return reDesiplexFilter.test(link)})
          }
          if (newLinkrulez[0] && desirulez && desirulez !== "") {
            newLinkrulez = ["desirulez", newLinkrulez[0].match(reDesirulezLink)[1]/*.replace(/html\?s=(.*)/i, 'html')*/]
            episode.link.push(newLinkrulez)
          }
          if (newLinkplex[0] && desiplex && desiplex!=="") {
            newLinkplex = ["desiplex", newLinkplex[0].match(reDesiplexLink)[1]]
            episode.link.push(newLinkplex)
          } else if (!newLinkplex[0] && i>0 && desiplex && desiplex!=="") {
            var link = desiserial[1].link.filter(link=>{return link[0]==="desiplex"})[0]
            var date = /[1-3]?[0-9][snrt][tdh]-(january)?(february)?(march)?(april)?(may)?(june)?(july)?(august)?(september)?(october)?(november)?(december)?-20[0-9]{2}/i          
            link = [link[0], link[1].replace(date, episode.date.split(' ').join('-'))]
            episode.link.push(link)
          }
          return episode
        })
        console.log(desiserial)
        channelService.episodeList = desiserial
      },
      parseLinks: function(res){
        var desirulez = res.data.desirulez;
        var desitashann = res.data.desitashann
        var desiplex = res.data.desiplex
        var desiserial = res.data.desiserial
        
        var reDesiserial = /<center>.*?(<p>.*<\/p>)+.*?<\/center>/gi
        var reDesiserialGroups = /<p><b><span style="color: red;">.*?<\/a><\/p>/gi
        var reDesiserialSource = /<p><b><span style="color: red;">(.*?)<\/span><\/b><\/p>/i
        var reDesiserialLink = /<a href="(.*?)" target="_blank" rel="noopener">.*?<\/a>/gi
        var reDesiserialHref = /<a href="(.*?)" target="_blank" rel="noopener">.*?<\/a>/i
        
        var reDesiplex = /<div class="post-content description " itemprop="articleBody">.*?<\/p><\/div>/gi
        var reDesiplexGroups = /<div class="buttons btn_green">.*?<\/p>/gi
        var reDesiplexSource = /<span class="single-heading">(.*?)<\/span>/i
        var reDesiplexLink = /<a href="(.*?)"(\s)?target="_blank">.*?<\/a>/gi
        var reDesiplexHref = /<a href="(.*?)"(\s)?target="_blank">.*?<\/a>/i
        
        var reDesirulez = /<div style="text-align: center;">.*?<\/div>/gi
        var reDesirulezGroups = /<b><font color="Red">.*?<\/a><br \/><br \/>/gi
        var reDesirulezSource = /<b><font color="Red">(.*?)<\/font><\/b>/i
        var reDesirulezLink = /<a rel="nofollow" href="(.*?)"(\s)?target="_blank">.*?<\/a>/gi
        var reDesirulezHref = /<a rel="nofollow" href="(.*?)"(\s)?target="_blank">.*?<\/a>/i
        
        desiserial = desiserial.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        desiserial = desiserial.match(reDesiserial)[0]
        desiserial = desiserial.match(reDesiserialGroups)
        if (desiserial){ 
          desiserial = desiserial.map(link=>{
            var source = link.match(reDesiserialSource)[1].replace(/ 720p.*/i, "").replace(/ Single Link/i, "")
            var href = link.match(reDesiserialLink).map(link=>{return link.match(reDesiserialHref)[1]})
            link = {
              name: source,
              link: href,
              provider: "desiserial"
            }
            return link
          })
        }
        
        desiplex = desiplex.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        desiplex = desiplex.match(reDesiplex)
        if (desiplex){
          desiplex= desiplex[0]
          desiplex = desiplex.match(reDesiplexGroups)
          desiplex = desiplex.map(link=>{
            var source = link.match(reDesiplexSource)[1].replace(/ 720p.*/i, "").replace(/ Single Link/i, "")
            var href = link.match(reDesiplexLink).map(link=>{return link.match(reDesiplexHref)[1]})
            link = {
              name: source,
              link: href,
              provider: "desiplex"
            }
            return link
          })
        }
        
        desirulez = desirulez.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
        desirulez = desirulez.match(reDesirulez)
        if (desirulez){
          desirulez = desirulez[0]
          desirulez = desirulez.match(reDesirulezGroups)
          desirulez = desirulez.map(link=>{
            var source = link.match(reDesirulezSource)[1].replace(/ 720p.*/i, "").replace(/ Single Link/i, "")
            var href = link.match(reDesirulezLink).map(link=>{return link.match(reDesirulezHref)[1]})
            link = {
              name: source,
              link: href,
              provider: "desirulez"
            }
            return link
          })
        }
        if (!desiplex){
          desiplex = []
        }
        if (!desirulez){
          desirulez = []
        }
        if (!desiserial){
          desiserial = []
        }
        var links = desiserial.concat(desiplex).concat(desirulez)
        links.sort((a,b)=>{return a.link.length-b.link.length})
        channelService.links = links
      },
      parseVideo : function(res){
        var video = res.data.data
        var source = res.data.source.split(" ").join("").split("").join(".?")
        //var reIframe = /<IFRAME SRC=["']?.*?["']? (FRAMEBORDER=["']?0["']? )?(MARGINWIDTH=["']?0["']? )*(MARGINHEIGHT=["']?0["']? )*SCROLLING=["']?NO["']? WIDTH=["']?[0-9]*.?["']? HEIGHT=["']?[0-9]*.?["']? (allowfullscreen)?=?["']?(true)?["']?>.*?<\/IFRAME>/gi
        //var reLink = /<IFRAME SRC=["']?(.*?)["']? (FRAMEBORDER=["']?0["']? )?(MARGINWIDTH=["']?0["']? )*(MARGINHEIGHT=["']?0["']? )*SCROLLING=["']?NO["']? WIDTH=["']?[0-9]*.?["']? HEIGHT=["']?[0-9]*.?["']? (allowfullscreen)?=?["']?(true)?["']?>.*?<\/IFRAME>/i
        var reIframe = /<IFRAME.*?SRC=["']?.*?["']?.*?>.*?<\/IFRAME>/gi
        var reLink = /SRC=["']?(.*?)["']? /i
        var reLinkFilter = new RegExp('SRC=[\"\']?.*?'+source+'.*?[\"\']? ' ,'i')
        console.log(reLinkFilter)
        if (res.data.provider === "desiserial"){
          //var reIframe = /<IFRAME SRC=["'].*?["'] FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=[0-9]* HEIGHT=[0-9]* allowfullscreen>.*?<\/IFRAME>/gi
          //var reLink = /<IFRAME SRC=["'](.*?)["'] FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=[0-9]* HEIGHT=[0-9]* allowfullscreen>.*?<\/IFRAME>/i
          video = video.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
          video = video.match(reIframe)
          if (video) {
            video = video.filter(src=>{return reLinkFilter.test(src)})[0]
            video = video.match(reLink)[1]
            channelService.video = video
          } else {
            channelService.link = undefined
            channelService.error = "File Deleted"
          }
        } else if (res.data.provider === "desirulez") {
          var refresh =  (/HTTP-EQUIV="refresh"/i).test(video)
          if (refresh){
            video = video.match(/CONTENT="0;URL=(http.*?)"/i)[1]
            video = {
              provider: 'desirulez',
              link: video,
              source: res.data.source
            }
            channelService.getVideo(video).then(function(res){
              video = res.data.data
              //var reIframe = /<IFRAME SRC=["'].*?["'] FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=[0-9]* HEIGHT=[0-9]* allowfullscreen>.*?<\/IFRAME>/gi
              //var reLink = /<IFRAME SRC=["'](.*?)["'] FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=[0-9]* HEIGHT=[0-9]* allowfullscreen>.*?<\/IFRAME>/i
              video = video.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
              video = video.match(reIframe)
              if (video) {
                video = video.filter(src=>{return reLinkFilter.test(src)})[0]
                video = video.match(reLink)[1]
                channelService.video = video
              } else {
                channelService.link = undefined
                channelService.error = "File Deleted"
              }
            })
          } else {
            //var reIframe = /<IFRAME SRC=["'].*?["'] FRAMEBORDER=["']0["'] (MARGINWIDTH=["']0["'] )*(MARGINHEIGHT=["']0["'] )*SCROLLING=["']NO["'] WIDTH=["'][0-9]*["'] HEIGHT=["'][0-9]*["']? ['"]?allowfullscreen['"]?>.*?<\/IFRAME>/gi
            //var reLink = /<IFRAME SRC=["'](.*?)["'] FRAMEBORDER=["']0["'] (MARGINWIDTH=["']0["'] )*(MARGINHEIGHT=["']0["'] )*SCROLLING=["']NO["'] WIDTH=["'][0-9]*["'] HEIGHT=["'][0-9]*["']? ['"]?allowfullscreen['"]?>.*?<\/IFRAME>/i
            video = video.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
            video = video.match(reIframe)
            if (video) {
              video = video.filter(src=>{return reLinkFilter.test(src)})[0]
              video = video.match(reLink)[1]
              channelService.video = video
            } else {
              channelService.link = undefined
              channelService.error = "File Deleted"
            }
          }
        } else if (res.data.provider === "desiplex") {
          //var reIframe = /<IFRAME SRC=["']?.*?["']? FRAMEBORDER=["']?0["']? (MARGINWIDTH=["']?0["']? )*(MARGINHEIGHT=["']?0["']? )*SCROLLING=["']?NO["']? WIDTH=["']?[0-9]*["']? HEIGHT=["']?[0-9]*["']? allowfullscreen>.*?<\/IFRAME>/gi
          //var reLink = /<IFRAME SRC=["']?(.*?)["']? FRAMEBORDER=["']?0["']? (MARGINWIDTH=["']?0["']? )*(MARGINHEIGHT=["']?0["']? )*SCROLLING=["']?NO["']? WIDTH=["']?[0-9]*["']? HEIGHT=["']?[0-9]*["']? allowfullscreen>.*?<\/IFRAME>/i
          video = video.replace(/\n/g,"").replace(/<br>/g, "").replace(/\r/g, "").replace(/\t/g,"")
          video = video.match(reIframe)
          if (video) {
            video = video.filter(src=>{return reLinkFilter.test(src)})[0]
            video = video.match(reLink)[1]
            console.log(video)
            channelService.video = video
          } else {
            channelService.link = undefined
            channelService.error = "File Deleted"
          }
        } 
      },
    }
    return channelService;
  })
