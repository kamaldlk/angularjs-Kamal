angular.module('toDo')
    .config(['$stateProvider', '$urlRouterProvider', "$sceProvider",
        function ($stateProvider, $urlRouterProvider, $sceProvider) {
            $urlRouterProvider.otherwise('/home');
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'templates/home/home.html',
                    controller:'homeController'
                })
                .state('calendar', {
                    url: '/calendar',
                    templateUrl: 'templates/calendar/calendar.html',
                    controller:'calendarController'
                })
                .state('dashboard', {
                    url: '/dashboard',
                    templateUrl: 'templates/dashboard/dashboard.html',
                    controller:'dashboardController'
                });

            $sceProvider.enabled(false);

        }
    ])
    .run(function(settings){
        settings.load();
    });
