angular.module("toDo.directive").directive("dateTime", ['$interval','$filter',function ($interval,$filter) {
    return {
        link: function (scope, elem, attr) {

           $interval(function(){
            scope.now = $filter('date')(new Date(), "hh:mm:ss");
            
           },1000)

        },
        template:"<span>{{now}}</span>"
    }
}]);