angular
  .module('show')
  .component('show', {
    templateUrl: "/show/show.template.html",
    controller:function($stateParams, channelService, $scope, $http){
      var self = this
      self.channel = decodeURIComponent($stateParams.channel)
      self.episodes = [];
      self.showError = false;
      $scope.$watch(function(){
        return channelService.channels
      }, function (newVal, oldVal){
        console.log(newVal)
        if (newVal && channelService.show){
          self.show = channelService.show
          console.log(self.show)
        } else if (newVal && !channelService.show) {
          self.show = channelService.channels.filter(channel=>{return channel.channel.name === decodeURIComponent($stateParams.channel)})[0]
          self.show = self.show.shows.filter(show=>{return show.name === decodeURIComponent($stateParams.show)})[0]
          channelService.show = self.show
          console.log(self.show)
        } else if (!newVal && !channelService.show){
          channelService.channel().then(res=>channelService.parseChannels(res))
        }
      })
      $scope.$watch(function(){
        return channelService.show
      }, function (newVal, oldVal){
        if (newVal) {
          channelService.episodes(channelService.show).then(res=>channelService.parseEpisodes(res))
        }
      })
      $scope.$watch(function(){
        return channelService.episodeList
      }, function (newVal, oldVal){
        if (newVal){
          self.episodes = channelService.episodeList
        }
        if (self.episodes.length===0 || self.episodes === undefined){
          self.showError = true;
        }  else {
          self.showError = false;
        }
      })
      self.select=function(episode){
        channelService.episode=episode
      }
    }
  })
