angular.module("toDo.provider")
    .provider("dataStore", function dataStoreProvider() {
        var that = this;
        that.allEvents = [];
        var prepareDB = function () {
            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            if (!window.indexedDB) {
                console.error("IndexedDb is not supported");
                that.useLocalStored = true;
            }

            var request = window.indexedDB.open("calendar", 1);
            request.onerror = function (event) {
                console.log("error in opening calender DB");
            };
            request.onsuccess = function (event) {
                that.db = event.target.result;
                //that.calendarDB = that.db.transaction("calendarEvents", "readwrite").objectStore("calendarEvents");
                that.dbCreated = true;
                getAllEvent();
            };
            request.onupgradeneeded = function (event) {
                that.db = event.target.result;
                var objectStore = that.db.createObjectStore("calendarEvents", {
                    keyPath: "date"
                });
                objectStore.transaction.oncomplete = function (event) {
                    that.calendarDB = that.db.transaction("calendarEvents", "readwrite").objectStore("calendarEvents");
                    getAllEvent();
                }
                that.dbCreated = true;
            }
        };

        prepareDB();

        var getAllEvent = function (callback) {
            that.allEvents.length = 0;
            that.calendarDB = that.db.transaction("calendarEvents", "readwrite").objectStore("calendarEvents");
            that.calendarDB.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    that.allEvents.push(cursor.value);
                    cursor.continue();
                } else {
                    if (callback) {
                        callback(that.allEvents);
                    }
                }
            }
        }

        this.$get = ['$q',function ($q) {

            var dataStore = {};

            dataStore.allEvents = that.allEvents;
            
            dataStore.addEvent = function (event) {
                that.calendarDB = that.db.transaction("calendarEvents", "readwrite").objectStore("calendarEvents");
                that.calendarDB.add(event);
            };

            dataStore.getEvent = function (evt_key) {
                var deffered = $q.defer();
                if (that.useLocalStored) return;
                that.calendarDB = that.db.transaction("calendarEvents", "readwrite").objectStore("calendarEvents");
                var result = that.calendarDB.get(evt_key);
                result.onsuccess = function (event) {
                    console.log("result of getEvent ", event);
                    deffered.resolve(event.target.result);
                };
                result.onerror = function (event) {
                    deffered.reject(event);
                }
                return deffered.promise;
            };
            
            dataStore.updateEvent = function (event) {
                 that.calendarDB = that.db.transaction("calendarEvents", "readwrite").objectStore("calendarEvents");
                 that.calendarDB.put(event);
            }

            dataStore.removeEvent = function (evtId) {
                that.calendarDB = that.db.transaction("calendarEvents", "readwrite").objectStore("calendarEvents");
                that.calendarDB.delete(evtId);
            }

            return dataStore;
        }]
    });