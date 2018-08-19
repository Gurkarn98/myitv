angular
  .module('shows')
  .component('shows', {
    templateUrl: "/shows/shows.template.html",
    controller:function($stateParams, channelService, $scope, $http){
      var self = this
      console.log('shows')
      $scope.$watch(function(){
        return channelService.channels
      }, function (newVal, oldVal){
        if (newVal){
          self.shows = channelService.channels.filter(channel=>{return channel.channel.name === decodeURIComponent($stateParams.channel)})[0]
          console.log(self.shows)
        } else if (!newVal){
          channelService.channel().then(res=>channelService.parseChannels(res))
        }
      })
      self.select=function(show){
        channelService.show=show
      }
    }
  })