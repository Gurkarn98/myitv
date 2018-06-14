angular
  .module('videoPage')
  .component('videoPage', {
    templateUrl: "/videoPage/videoPage.template.html",
    controller:function(channelService, $scope, $sce){
      var self = this
      $scope.$watch(function(){
        return channelService.video
      }, function (newVal, oldVal){
        console.log(newVal)
        if (newVal){
          self.video = channelService.video
        }
      })
      $scope.$watch(function(){
        return channelService.error
      }, function (newVal, oldVal){
        console.log(newVal)
        self.error = channelService.error
      })
      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      }
    }
  })