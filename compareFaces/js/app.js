var app = angular.module('app', ['ngRoute']);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        
    $routeProvider.when('/compareFaces', { //Routing for show list of employee
        templateUrl: 'views/compareFaces.html',
        controller: 'CompareFaceController'
    })
}]);