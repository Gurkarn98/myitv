angular
  .module('channels')
  .component('channels', {
    templateUrl: "/channels/channels.template.html",
    controller:function($scope, $http, channelService){
      var self = this
      self.channels = []
      channelService.channel().then(res=>channelService.parseChannels(res))
      $scope.$watch(function(){
        return channelService.channelList
      }, function (newVal, oldVal){
        if (newVal){
          self.channels = channelService.channelList
        }
      })
    }
  })
