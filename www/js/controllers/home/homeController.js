'use strict';
angular.module('toDo.controllers')

.controller('homeController', ['$scope','$rootScope', '$http', '$state','settings',
    function($scope,$rootScope, $http, $state,settings) {
        if(typeof(settings.userName) != Object && settings.userName != ""){
            $state.go("calendar");
        }
        $scope.aceptName = function() {
            settings.userName = $scope.userName;    
            $state.go("calendar");
        }
        $rootScope.minimize = function(){
            chrome.app.window.current().minimize();
        }
        $rootScope.close = function() {
            chrome.app.window.current().close();
            window.close();
        }
    }
]);
