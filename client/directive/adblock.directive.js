angular.
  module('app')
  .directive('adblock', function() {
  return {
    restriction: 'A',
    priority: 100,
    link: function(scope, element, attrs) {
      element.bind('load', function() {
      });
    }
  }
});