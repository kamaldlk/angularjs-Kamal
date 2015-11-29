angular.module("toDo.services").service('settings', function () {
    var service = this;
    var settings = {};
    service.loaded = false;

    service.load = function (callback) {
        chrome.storage.local.get(function (data) {
            for (var key in data) {
                settings[key] = data[key];
            }
        });
    };

    var defineSettings = function (key, mode) {
        Object.defineProperty(service, key, {
            get: function () {
                return settings[key] || {};
            },
            set: function (val) {
                settings[key] = val;
                var obj = {};
                obj[key] = val;
                chrome.storage[mode].set(obj, function () {

                });
            }
        });
    };

    defineSettings("userName", "local");
});