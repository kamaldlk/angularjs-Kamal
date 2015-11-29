'use strict';
angular.module('toDo.controllers')

.controller('dashboardController', ['$scope', '$rootScope', '$http', '$state', '$timeout', '$mdSidenav', '$mdUtil', '$log', '$mdDialog','events',
    function($scope, $rootScope, $http, $state, $timeout, $mdSidenav, $mdUtil, $log, $mdDialog,Events) {
       
        $rootScope.reoccurence = false;
        $rootScope.reoccurenceint = false;

        $scope.currentDate = $state.params;
        console.log('state params ',$state.params);
        
        $scope.toDoCreate = function(ev) {
            $log.debug("add");
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/dashboard/dialogs/toDoCreate.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        $scope.fastRemCreate = function(ev) {
            $log.debug("add");
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/dashboard/dialogs/fastRemCreate.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        $scope.notePadCreate = function(ev) {
            $log.debug("add");
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/dashboard/dialogs/notepadCreate.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        function DialogController($scope, $rootScope, $mdDialog) {
           $scope.myDate = new Date();
            $scope.minDate = new Date(
                $scope.myDate.getFullYear(),
                $scope.myDate.getMonth(),
                $scope.myDate.getDate()
            );
            
            $scope.addNewEvent = function(event){
                console.log("event details ",event);
                Events.create(event);
                $mdDialog.cancel();
             
                /*var audio = new Audio('audio_file.mp3');
                audio.play();*/
            }
            
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            
            $scope.reoccurence = function() {
                $rootScope.reoccurence = true;
                $rootScope.reoccurenceint = true;
            };
            
            $scope.reoccurenceCancel = function(){
                $rootScope.reoccurenceint = false;
                $rootScope.reoccurence = false;
            }
        }
    }
]);