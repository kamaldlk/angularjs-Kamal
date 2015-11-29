angular.module("toDo.services").service("events", function (dataStore, $filter) {

    var audioFile = "alartTone.mp3";
    chrome.alarms.clearAll();
    chrome.alarms.onAlarm.addListener(function (alarm) {
        var temp = alarm.name.split("_");
        var date = temp[0];
        dataStore.getEvent(date).then(function (event) {
            if (event && event.events) {
                var alrtEvent = _.findWhere(event.events, {
                    id: temp[1]
                });
                console.log("firing alarm for event ",alrtEvent);
                if (alrtEvent)
                    raiseAlert(alrtEvent);
            }
        });
    });

   var raiseAlert  = function (event) {
        var audio = new Audio(audioFile);
        audio.play();
    };

     var getEvent = function (eventDate) {
        dataStore.getEvent(eventDate).then(function (events) {
            console.log("reuslt of get events ", events);
            if (events && events.events) {
                return events;
            }
        });
    };
    
    
    var createEvent = function (data) {
        var alarmTime = new Date(
            data.date.getFullYear(),
            data.date.getMonth(),
            data.date.getDate(),
            data.time.hour,
            data.time.minute
        );
        
        data.id = Math.random().toString();
        data.date = $filter("date")(data.date, "MMM d, y");
        var events = getEvent(data.date);
        if (events && events.events) {
            events.events.push(data);
            dataStore.updateEvent(events);
        } else {
            var newEvent = {
                date: data.date,
                events: []
            };
            newEvent.events.push(data);
            dataStore.addEvent(newEvent);
        }
        chrome.alarms.create(data.date + "_" + data.id, {
            when: alarmTime.getTime(),
            periodInMinutes:1
        });

    };

    var updateEvent = function (data) {
        data.date = $filter("date")(data.date, "MMM d, y");
        var events = getEvent(data.date);
        if (events && events.events) {
            var temp = _.findWhere(events.events, {
                id: data.id
            });
            events.events.splice(_.indexOf(temp), 1);
            events.events.push(data);
            dataStore.updateEvent(events);
        }

        chrome.alarms.clear(data.date + "_" + data.id, function (isCleared) {
            if (isCleared) {
                var alarmTime = new Date(
                    data.date.getFullYear(),
                    data.date.getMonth(),
                    data.date.getDate(),
                    data.time.hour,
                    data.time.minute
                );

                chrome.alarms.create(data.date + "_" + data.id, {
                    when: alarmTime.getTime()
                });
            }
        });
    };

    var removeEvent = function (data) {
        var events = getEvent(data.date);
        if (events && events.events) {
            var temp = _.findWhere(events.events, {
                id: data.id
            });
            events.events.splice(_.indexOf(temp), 1);
            dataStore.updateEvent(events);
        }

        chrome.alarms.clear(data.date + "_" + data.id, function (isCleared) {
            if (isCleared) {
                console.log("event is cleared");
            }
        });
    };

    var getAllEvent = function(){
        
    };

     this.create = createEvent;
    this.update = updateEvent;
    this.remove = removeEvent;
    this.get = getEvent;
    this.getAll = getAllEvent;
    
});