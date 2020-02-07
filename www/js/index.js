    let global = {};
    
    // Wait for device API libraries to load
    //
    var app = {
        // Application Constructor
        initialize: function() {
            this.bindEvents();
        },
        // Bind Event Listeners
        //
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },
        // deviceready Event Handler
        //
        // The scope of 'this' is the event. In order to call the 'receivedEvent'
        // function, we must explicitly call 'app.receivedEvent(...);'
        onDeviceReady: function() {
            console.log("deviceReady fired");
            // console.log($("#device-list").val());
            user = window.session.getInstance().get();
            if (user.devices == undefined) {
                $.mobile.changePage("#login-page", { transition: "slidedown", changeHash: false });
            }
            else {
                window.devices.dev_unit = user.devices
                window.devices.refresh_device_list();
                $.mobile.changePage("#main-page", { transition: "slidedown", changeHash: false });
            }

        },
        // Update DOM on a Received Event
   
    };

///////////////////////////////////////////////////////////////
///////////////// Helper to allow classes and inheritance /////
(function () {
    var isFn = function (fn) { return typeof fn == "function"; };
    PClass = function () { };
    PClass.create = function (proto) {
        var k = function (magic) { // call init only if there's no magic cookie
            if (magic != isFn && isFn(this.init)) this.init.apply(this, arguments);
        };
        k.prototype = new this(isFn); // use our private method as magic cookie
        for (key in proto) (function (fn, sfn) { // create a closure
            k.prototype[key] = !isFn(fn) || !isFn(sfn) ? fn : // add _super method
                function () { this._super = sfn; return fn.apply(this, arguments); };
        })(proto[key], k.prototype[key]);
        k.prototype.constructor = k;
        k.extend = this.extend || this.create;
        return k;
    };
})();
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

// module.exports = {
//     PClass
// };