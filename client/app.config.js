angular.
  module('app').
  config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function routes($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.rule(function($injector, $location) {
        var path = $location.path();
        var hasTrailingSlash = path[path.length-1] === '/';
        if(hasTrailingSlash) {
          var newPath = path.substr(0, path.length - 1); 
          return newPath; 
        } 
      });
    $stateProvider.
      state('channels', {
        url: '/',
        template: '<channels></channels>',
        data :  {
          authenticate : false
        }
      }).
      state('shows', {
        url: '/:channel',
        template: '<shows></shows>',
        data :  {
          authenticate : false
        }
      }).
      state('show', {
        url: '/episodes/:channel=>:show',
        template: '<show></show>',
        data :  {
          authenticate : false
        }
      }).
      state('episode', {
        url: '/episode/:channel=>:show=>:episode',
        template: '<episode></episode>',
        data :  {
          authenticate : false
        }
      }).
      state('episode.video', {
        url: '',
        template: '<video-page></video-page>',
        data :  {
          authenticate : false
        }
      })
  }])