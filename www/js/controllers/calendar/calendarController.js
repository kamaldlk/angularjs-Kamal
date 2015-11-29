'use strict';
angular.module('toDo.controllers')

.controller('calendarController', ['$scope', "$mdSidenav", "$filter", "dataStore", "$timeout", "$q", '$state', '$mdDialog', 'settings','$rootScope', function ($scope, $mdSidenav, $filter, dataStore, $timeout, $q, $state, $mdDialog, settings,$rootScope) {

    $scope.calendar = {
        userName: settings.userName,
        start: new Date(),
        nextMonth: function () {
            $scope.$broadcast('calendar:nextMonth', '');
        },
        prevMonth: function () {
            $scope.$broadcast('calendar:prevMonth', '');
        }
    };
    $scope.selectedDate = null;
    $scope.firstDayOfWeek = 0;
    $scope.direction = "horizontal";
    $scope.allEvents = dataStore.allEvents;

    $scope.setDirection = function (direction) {
        $scope.direction = direction;
    };

    $scope.dayClick = function (date) {
        // $scope.msg = "You clicked " + $filter("date")(date, "MMM d, y h:mm:ss a Z");

        $scope.currentDay = {
            date: null,
            events: [],
        };
        $scope.currentDay.date = $filter("date")(date, "MMM d, y");
        
        $rootScope.currentDate = $scope.currentDay; 
        
        $state.go("dashboard");
        
        
       /* dataStore.getEvent($scope.currentDay.date).then(function (events) {
            console.log("reuslt of get events ", events);
            if (events && events.events) {
                $mdSidenav("right")
                    .toggle();
                $scope.currentDay.events = events.events;
            } else {
                $scope.calendar.createNewEvent();
            }
        });*/
    };

    $scope.calendar.createNewEvent = function () {
        var event = {
            id: Math.random(),
            title: "saraTest",
            describtion: "alkdfsjdsj",
            startTime: "8AM",
            endTime: "9AM",
            status: "progress"
        };
        $mdDialog.show({
            controller: newEventController,
            templateUrl: 'templates/dashboard/dialogs/toDoCreate.html',
            clickOutsideToClose: true
        })
    };

    $scope.calendar.addNewEvent = function (event) {
        dataStore.getEvent($scope.currentDay.date).then(function (data) {
            $scope.currentDay.events.push(event);
            if (!data) {
                dataStore.addEvent($scope.currentDay);
            } else {
                data.events.push(event);
                dataStore.updateEvent(data);
            }
        });
    };

    $scope.calendar.updateEvent = function (event) {
        dataStore.getEvent($scope.currentDay.date).then(function (data) {
            data.events.forEach(function (evt, i) {
                if (evt.id == event.id) {
                    data.events[i] = event;
                }
            });
            dataStore.updateEvent(data);
        });
    };

    $scope.calendar.closeEvent = function (eventId) {
        var event;
        for (var i = 0; i < $scope.currentDay.events.length; i++) {
            if ($scope.currentDay.events[i].id == eventId) {
                $scope.currentDay.events.splice(i, 1);
                if ($scope.currentDay.events.length <= 0)
                    dataStore.removeEvent($scope.currentDay.date);
                dataStore.updateEvent($scope.currentDay);
            }
        }
    };

    $scope.prevMonth = function (data) {
        var temp = new Date();
        temp.setMonth(data.month);
        $scope.calendar.start = $filter("date")(temp, "MMMM y");
        // $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
    };
    $scope.nextMonth = function (data) {
        var temp = new Date();
        temp.setMonth(data.month);
        $scope.calendar.start = $filter("date")(temp, "MMMM y");
        //$scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
    };

    $scope.setDayContent = function (date) {
        var deffered = $q.defer();
        $timeout(function () {
            var thisDay = _.findWhere($scope.allEvents, {
                date: $filter("date")(date, "MMM d, y")
            });
            console.log("today's event ", thisDay);
            var evtHtml = "";
            if (thisDay && thisDay.events.length >= 2) {
                evtHtml = "<p>" + thisDay.events[0].title + "</p><p>" + thisDay.events[1].title + "<p>...";
            } else if (thisDay && thisDay.events.length < 2 && thisDay.events.length > 0) {
                evtHtml = "<p>" + thisDay.events[0].title + "</p>";
            }
            console.log("returning html is ", evtHtml);
            deffered.resolve(evtHtml);
        }, 500);
        return deffered.promise;
    };

    function newEventController($scope, $filter) {
        $scope.myDate = new Date();
        $scope.minDate = new Date(
            $scope.myDate.getFullYear(),
            $scope.myDate.getMonth(),
            $scope.myDate.getDate());
        $scope.newEvent = {};
        $scope.addNewEvent = function (event) {
            event.eventDate = $filter('date')(event.eventDate, "MMM d, y");
            console.log('event details is ', event);
            $mdDialog.cancel();
        };
        $scope.cancelDialog = function () {
            $mdDialog.cancel();
        }
    };

}]);