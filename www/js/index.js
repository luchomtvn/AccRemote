let global = {};

// Wait for device API libraries to load
//
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        console.log("deviceReady fired");
        // console.log($("#device-list").val());
        // user = window.session.getInstance().get();
        // if (user && user.devices != undefined) {
        //     window.devices.dev_unit = user.devices
        //     window.devices.refresh_device_list();
        //     // $.mobile.changePage("#main-page", { transition: "slidedown", changeHash: false });
        // }

    },
    // Update DOM on a Received Event

};