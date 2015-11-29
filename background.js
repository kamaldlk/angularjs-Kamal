chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('www\\index.html', {
        id: "",
        singleton: true,
        bounds: {
            width: 1080,
            height: 690
        },
        resizable: false,
        frame: {
            type: 'none'
        }
    }, function (createdWindow) {
        createdWindow.onMinimized.addListener(function () {
          
        });
        createdWindow.onClosed.addListener(function () {
            
        });
    });
    
     chrome.alarms.onAlarm.addListener(function (alarm) {
        var temp = alarm.name.split("_");
        var date = temp[0];
        var audio = new Audio("www\\alartTone.mp3");
        audio.play();
    });
    
});

var logger = null;
