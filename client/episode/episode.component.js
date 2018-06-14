angular
  .module('episode')
  .component('episode', {
    templateUrl: "/episode/episode.template.html",
    controller:function($stateParams, channelService, $scope, $http){
      var self = this
      self.channel = decodeURIComponent($stateParams.channel)
      $scope.$watch(function(){
        return channelService.channels
      }, function (newVal, oldVal){
        if (newVal && channelService.show && channelService.episode){
          self.show = channelService.show
          self.episode = channelService.episode
        } else if (newVal && !channelService.show) {
          self.show = channelService.channels.filter(channel=>{return channel.channel.name === decodeURIComponent($stateParams.channel)})[0]
          self.show = self.show.shows.filter(show=>{return show.name === decodeURIComponent($stateParams.show)})[0]
          channelService.show = self.show
        } else if (!newVal && !channelService.show){
          channelService.channel().then(res=>channelService.parseChannels(res))
        }
      })
      $scope.$watch(function(){
        return channelService.episode
      }, function (newVal, oldVal){
        if (newVal){
          channelService.getLinks(channelService.episode).then(res=>channelService.parseLinks(res))
        }
      })
      $scope.$watch(function(){
        return channelService.show
      }, function (newVal, oldVal){
        if (newVal){
          channelService.episodes(channelService.show).then(res=>channelService.parseEpisodes(res))
        }
      })
      $scope.$watch(function(){
        return channelService.episodeList
      }, function (newVal, oldVal){
        if (newVal){
          self.episode = channelService.episodeList.filter(episode=>{return episode.date === decodeURIComponent($stateParams.episode)})[0]
          channelService.episode = self.episode
        }
      })
      $scope.$watch(function(){
        return channelService.links
      }, function (newVal, oldVal){
        if (newVal){
          self.links = channelService.links
        }
      })
      $scope.$watch(function(){
        return channelService.selectedSource
      }, function (newVal, oldVal){
        console.log(newVal)
        self.selected = channelService.selectedSource
      })
      self.select=function(provider, href, source, selectedSource){
        var selected= {
          provider: provider,
          link: href,
          source: source
        }
        channelService.selectedSource = selectedSource
        channelService.getVideo(selected).then(res=>channelService.parseVideo(res))
        channelService.error = undefined
      }
      self.selectPart=function(provider, href, source){
        console.log('click')
        var selected= {
          provider: provider,
          link: href,
          source: source
        }
        channelService.getVideo(selected).then(res=>channelService.parseVideo(res))
        channelService.error = undefined
      }
    }
  })