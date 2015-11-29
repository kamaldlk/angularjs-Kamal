angular.module("toDo.directive").directive("calendarMd", ["$compile", "$timeout", "$parse", "$http", "$q", "$filter", "$log", "Calendar", function ($compile, $timeout, $parse, $http, $q, $filter, $log, Calendar) {

    var hasCss;
    var defaultTemplate = "<md-content layout='column' layout-fill flex md-swipe-left='next()' md-swipe-right='prev()'><md-toolbar><div class='md-toolbar-tools' layout='row'><md-button ng-click='prev()' aria-label='Previous month'><md-tooltip ng-if='::tooltips()'>Previous month</md-tooltip>&laquo;</md-button><div flex></div><h2 class='calendar-md-title'><span>{{ calendar.start | date:titleFormat:timezone }}</span></h2><div flex></div><md-button ng-click='next()' aria-label='Next month'><md-tooltip ng-if='::tooltips()'>Next month</md-tooltip>&raquo;</md-button></div></md-toolbar><!-- agenda view --><md-content style='height:0px' ng-if='weekLayout === columnWeekLayout' class='agenda'><div ng-repeat='week in calendar.weeks track by $index'><div ng-if='sameMonth(day)' ng-class='{ active: active === day }' ng-click='handleDayClick(day)' ng-repeat='day in week' layout><md-tooltip ng-if='::tooltips()'>{{ day | date:dayTooltipFormat:timezone }}</md-tooltip><div>{{ day | date:dayFormat:timezone }}</div><div flex ng-bind-html='getDayContent(day)'></div></div></div></md-content><!-- calendar view --><md-content style='height:0px' ng-if='weekLayout !== columnWeekLayout' flex layout='column' class='calendar'><div layout='row' layout-fill class='subheader'><div layout-padding class='subheader-day' flex ng-repeat='day in calendar.weeks[0]'><md-tooltip ng-if='::tooltips()'>{{ day | date:dayLabelTooltipFormat }}</md-tooltip>{{ day | date:dayLabelFormat }}</div></div><div ng-if='week.length' ng-repeat='week in calendar.weeks track by $index' flex layout='row' layout-fill><div tabindex='{{ sameMonth(day) ? (day | date:dayFormat:timezone) : 0 }}' ng-repeat='day in week track by $index' ng-click='handleDayClick(day)' flex layout layout-padding ng-class='{&quot;disabled&quot; : ! sameMonth(day), &quot;active&quot;: isActive(day), &quot;md-whiteframe-12dp&quot;: hover || focus }' ng-focus='focus = true;' ng-blur='focus = false;' ng-mouseleave='hover = false' ng-mouseenter='hover = true'><md-tooltip ng-if='::tooltips()'>{{ day | date:dayTooltipFormat }}</md-tooltip><div>{{ day | date:dayFormat }}</div><div flex ng-bind-html='data[dayKey(day)]'></div></div></div></md-content></md-content>";

    var injectCss = function () {
        if (!hasCss) {
            var head = document.getElementsByTagName("head")[0];
            var css = document.createElement("style");
            css.type = "text/css";
            css.id = "calendarMdCss";
            css.innerHTML = "calendar-md md-content>md-content.agenda>*>* :not(:first-child),calendar-md md-content>md-content.calendar>:not(:first-child)>* :last-child{overflow:hidden;text-overflow:ellipsis}calendar-md{display:block;max-height:100%}calendar-md md-content>md-content{border:1px solid rgba(0,0,0,.12)}calendar-md md-content>md-content.agenda>*>*{border-bottom:1px solid rgba(0,0,0,.12)}calendar-md md-content>md-content.agenda>*>* :first-child{padding:12px;width:200px;text-align:right;color:rgba(0,0,0,.75);font-weight:100;overflow-x:hidden;text-overflow:ellipsis;white-space:nowrap}calendar-md md-content>md-content.calendar>:first-child{background:rgba(0,0,0,.02);border-bottom:1px solid rgba(0,0,0,.12);margin-right:0;min-height:36px}calendar-md md-content>md-content.calendar>:not(:first-child)>*{border-bottom:1px solid rgba(0,0,0,.12);border-right:1px solid rgba(0,0,0,.12);cursor:pointer}calendar-md md-content>md-content.calendar>:not(:first-child)>:hover{background:rgba(0,0,0,.04)}calendar-md md-content>md-content.calendar>:not(:first-child)>.disabled{color:rgba(0,0,0,.3);pointer-events:none;cursor:auto}calendar-md md-content>md-content.calendar>:not(:first-child)>.active{background:#FFCC80}calendar-md md-content>md-content.calendar>:not(:first-child)>* :first-child{padding:0}";
            head.insertBefore(css, head.firstChild);
            hasCss = true;
        }
    };

    return {
        restrict: "E",
        scope: {
            ngModel: "=?",
            template: "&",
            templateUrl: "=?",
            onDayClick: "=?",
            onPrevMonth: "=?",
            onNextMonth: "=?",
            calendarDirection: "=?",
            dayContent: "&?",
            timezone: "=?",
            titleFormat: "=?",
            dayFormat: "=?",
            dayLabelFormat: "=?",
            dayLabelTooltipFormat: "=?",
            dayTooltipFormat: "=?",
            weekStartsOn: "=?",
            tooltips: "&?"
        },
        link: function ($scope, $element, $attrs) {
            console.log("directive socpe is ",$scope);
            // Add the CSS here.
            injectCss();
            var date = new Date();
            var month = parseInt($attrs.startMonth || date.getMonth());
            var year = parseInt($attrs.startYear || date.getFullYear());

            $scope.columnWeekLayout = "column";
            $scope.weekLayout = "row";
            $scope.timezone = $scope.timezone || null;

            // Parse the parent model to determine if it's an array.
            // If it is an array, than we'll automatically be able to select
            // more than one date.
            if ($attrs.ngModel) {
                $scope.active = $scope.$parent.$eval($attrs.ngModel);
                if ($attrs.ngModel) {
                    $scope.$watch("$parent." + $attrs.ngModel, function (val) {
                        $scope.active = val;
                    });
                }
            } else {
                $scope.active = null;
            }

            // Set the defaults here.
            $scope.titleFormat = $scope.titleFormat || "MMMM yyyy";
            $scope.dayLabelFormat = $scope.dayLabelFormat || "EEE";
            $scope.dayLabelTooltipFormat = $scope.dayLabelTooltipFormat || "EEEE";
            $scope.dayFormat = $scope.dayFormat || "d";
            $scope.dayTooltipFormat = $scope.dayTooltipFormat || "fullDate";

            $scope.sameMonth = function (date) {
                var d = angular.copy(date);
                return d.getFullYear() === $scope.calendar.year &&
                    d.getMonth() === $scope.calendar.month;
            };
            
            $scope.sameDay = function(day){
                var d = angular.copy(day);
                var today = new Date();
                return d.getFullYear() === today.getFullYear() &&
                    d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
            }
            
            $scope.calendarDirection = $scope.calendarDirection || "horizontal";

            $scope.$watch("calendarDirection", function (val) {
                $scope.weekLayout = val === "horizontal" ? "row" : "column";
            });

            $scope.$watch("weekLayout", function () {
                year = $scope.calendar.year;
                month = $scope.calendar.month;
                bootstrap();
            });

            var handleCb = function (cb, data) {
                (cb || angular.noop)(data);
            };

            var dateFind = function (arr, date) {
                var index = -1;
                angular.forEach(arr, function (d, k) {
                    if (index < 0) {
                        if (angular.equals(date, d)) {
                            index = k;
                        }
                    }
                });
                return index;
            };

            $scope.isActive = function (date) {
                var match;
                var active = angular.copy($scope.active);
                if (!angular.isArray(active)) {
                    match = angular.equals(date, active);
                } else {
                    match = dateFind(active, date) > -1;
                }
                return match;
            };
            
            $scope.$on("calendar:prevMonth",function(){
                $scope.prev();
            });
            
            $scope.prev = function () {
                $scope.calendar.prev();
                var data = {
                    year: $scope.calendar.year,
                    month: $scope.calendar.month + 1
                };
                setData();
                handleCb($scope.onPrevMonth, data);
            };

            $scope.$on("calendar:nextMonth",function(){
                $scope.next();
            });
            
            $scope.next = function () {
                $scope.calendar.next();
                var data = {
                    year: $scope.calendar.year,
                    month: $scope.calendar.month + 1
                };
                setData();
                handleCb($scope.onNextMonth, data);
            };

            $scope.handleDayClick = function (date) {

                var active = angular.copy($scope.active);
                if (angular.isArray(active)) {
                    var idx = dateFind(active, date);
                    if (idx > -1) {
                        active.splice(idx, 1);
                    } else {
                        active.push(date);
                    }
                } else {
                    if (angular.equals(active, date)) {
                        active = null;
                    } else {
                        active = date;
                    }
                }

                $scope.active = active;
                if ($attrs.ngModel) {
                    $parse($attrs.ngModel).assign($scope.$parent, angular.copy($scope.active));
                }

                $log.log("isActive", $scope.active, date, $scope.isActive(date));

                handleCb($scope.onDayClick, angular.copy(date));

            };

            // Small helper function to set the contents of the template.
            var setTemplate = function (contents) {
                $element.html(contents);
                $compile($element.contents())($scope);
            };

            var init = function () {

                $scope.calendar = new Calendar(year, month, {
                    weekStartsOn: $scope.weekStartsOn || 0
                });

                var deferred = $q.defer();
                // Allows fetching of dynamic templates via $http.
                if ($scope.templateUrl) {
                    $http
                        .get($scope.templateUrl)
                        .success(deferred.resolve)
                        .error(deferred.reject);
                } else {
                    deferred.resolve($scope.template() || defaultTemplate);
                }

                return deferred.promise;

            };


            // Set the html contents of each date.
            var getDayKey = function (date) {
                return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
            };

            $scope.data = {};
            $scope.dayKey = getDayKey;

            var getDayContent = function (date) {

                // Make sure some data in the data array.
                $scope.data[getDayKey(date)] = $scope.data[getDayKey(date)] || "";

                var cb = ($scope.dayContent || angular.noop)();
                var result = (cb || angular.noop)(date);

                // Check for async function. This should support $http.get() and also regular $q.defer() functions.
                if (angular.isObject(result) && "function" === typeof result.success) {
                    result.success(function (html) {
                        $scope.data[getDayKey(date)] = html;
                    });
                } else if (angular.isObject(result) && "function" === typeof result.then) {
                    result.then(function (html) {
                        $scope.data[getDayKey(date)] = html;
                    });
                } else {
                    $scope.data[getDayKey(date)] = result;
                }

            };

            var setData = function () {
                angular.forEach($scope.calendar.weeks, function (week) {
                    angular.forEach(week, getDayContent);
                });
            };

            window.data = $scope.data;

            var bootstrap = function () {
                init().then(function (contents) {
                    setTemplate(contents);
                    setData();
                });
            };

            $scope.$watch("weekStartsOn", init);
            bootstrap();

            // These are for tests, don't remove them..
            $scope._$$init = init;
            $scope._$$setTemplate = setTemplate;
            $scope._$$bootstrap = bootstrap;

        }
    };

}]);