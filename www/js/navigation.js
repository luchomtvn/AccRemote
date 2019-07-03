var SERVICE_UUID = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";
var accDevicesIds = {};

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
/**
 * Connection Classes:
 * Bluetooth Scanner: Scans devices compatible to equipments. The devices attribute will be used by a DeviceBluetooth to 
 * connect to it. 
 */

var BluetoothScanner = PClass.create({
    init: function() {
        this.devices = [];
    },
    scannedDevices: function() {
        return this.devices;
    },
    addDevice: function(name, id) {
        this.devices.push({ name: name, id: id });
    },
    startScan: function() {
        var self = this;
        try{eval("ble");} // checks if ble was defined
        catch (e) {
            if (e instanceof ReferenceError){ console.log("ble isn't defined"); return -1; }
        }
        ble.isEnabled(function(){
            console.log("bluetooth enabled");
        }, function () {
            console.log("bluetooth disabled");
        });
        ble.startScan([], function (device) {
            if (device.name == "AccControl") {
                // accDevicesIds[device.name] = device.id;
                self.addDevice(device.name, device.id);
                return 0;
                // $("#scan-result-list").append('<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + device.name + '</a> </li>');
            }
        });
        return 0;
    },
    stopScan: function() {
        ble.stopScan;
        console.log("Scan Stopped");
    }
});
/**
 * Connection interface:
 * Englobes bluetooth and websockets into a single class, so when a panel is created it can include an interface and then
 * assign the type of connection in runtime. 
 */
var ConnectionInterface = PClass.create({
    sendMessage: function(message){
        throw new Error("Must be implemented");
    },
    setReadCallback: function(funct){
        throw new Error("Must be implemented");
    }
});

/**
 * Allows connection to a bluetooth device after scanning, also sets callbacks and write functions. 
 * Extends to ConnectionInterface, so it can be instanciated as such in a panel
 */
var DeviceBluetooth = ConnectionInterface.extend({
    init: function(service_UUID, characteristic_UUID) {
        this.service_UUID = service_UUID;
        this.characteristic_UUID = characteristic_UUID;
        this.connected = false;
        this.connect_message = "Hello from ACC Control remote application, prepare to be conquered."
        this.connected_id = "";
        this.recieved_data = "";
    },
    connect: function(name, devices) {
        console.log("Attempting connection to " + name);
        var id = "";
        for(var i = 0; i < devices.length; i++){
            if (devices[i].name == name){
                id = devices[i].id;
                console.log("device was found in scanning");
            }
        }
        if(id == "") {console.log("DEVICE NAME WASN'T SCANNED: ");}
        let self = this;
        ble.connect(id, function (device) {
            console.log("Connected to " + name);
            self.connected = true;
            self.connected_id = id;
            ble.write(id,
                self.service_UUID,
                self.characteristic_UUID,
                stringToBytes(self.connect_message),
                function () { console.log("Sent conquering message"); },
                function () { console.log("Conquering failed"); }
            );
        }, function () {
            console.log("Disconnected from " + name);
        });
    },
    sendMessage: function(message){
        ble.write(this.connected_id,
            this.service_UUID,
            this.characteristic_UUID,
            stringToBytes(message),
            function () { console.log("Sent: '" + message + "'"); },
            function () { console.log("Couldn't send message"); }
        );
    },
    setReadCallback: function(fnct){
        let self = this;
        ble.read(this.connected_id,
            this.service_UUID,
            this.characteristic_UUID,
            fnct,
            function (failure) {
                console.log("Not recieving from custom callback in characteristic: " + self.characteristic_UUID);
            }
        );
    },
    listen(){
        let self = this;
        ble.read(this.connected_id,
            this.service_UUID,
            this.characteristic_UUID,
            function (data) {
                self.recieved_data = JSON.stringify(data);
            },
            function(failure){
                console.log("DeviceBluetooth failed to recieve data from characteristic " + self.characteristic_UUID);
            }
        );
    },
    stringToBytes: function(string) {
        var array = new Uint8Array(string.length);
        for (var i = 0, l = string.length; i < l; i++) {
            array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    }
});

/**
 * Simple Class wrapper for JavaScript websockets, it's main purpose is to have a class that extends from ConnectionInterface
 * and permits a panel to instanciate it inside it's constructor. 
 */
var DeviceWebSocket = ConnectionInterface.extend({
    init: function(url){
        this.url = url;
        this.ws = (this.url != undefined) ? new WebSocket(this.url) : new WebSocket("ws://127.0.0.1:5555");
    },
    setReadCallback: function(funct){
        this.ws.onmessage = funct;
    },
    sendMessage: function(message){
        this.ws.send(message);
    }
});

ControlElement = PClass.create({
    init: function(name, value, panel){
        this.name = name;
        this.value = value;
        this.panel = panel;
    }
});

/**
 * Buttons are created after a panel has been instantiated. They are created on main code according to 
 * panel type, and on creation they are associated with a panel, so as for them to have an entity to which to send 
 * the values when buttons are pressed. Button's method handle the button animation and value transfers when pressed on graphic.
 * 
 * Since i'm using prototype to make classes, i cant make methods private. All methods in this class are fired from within. There
 * are no necessary calls from outside this class to the methods in this class. Everything is set up once the button is created 
 * and a panel is asociated on it's creation. Given that an SVG file is present in DOM and a panel was created.
 * 
 * Note that an SVG file with buttons must be loaded in DOM in order to bind those buttons to the ones created using this class. 
 * If no svg is already loaded, graphic buttons wont be binded to button objects and pressing them won't have any effect. You can, 
 * however, bind them after button creation by executing get_svg_frame() method after adding svg file to DOM and assigning result to 
 * this.frame.
 * 
 * TODO: error handling is quite poor. 
 * 
 */
Button = ControlElement.extend({
    init: function(name, value, panel){
        this._super(name,value,panel);
        this.on_style = "";
        this.off_style = "";
        this.get_svg_frame();
        if (this.frame != undefined){
            this.style_frame();
            this.click_event();
            console.log("created button " + this.name);
        }
        else
            console.log("created button without graphic bind, clicking will have no effect");
    },
    click_event: function () {
        let self = this;
        this.frame.on("click", function () { // inside the function, 'this' is the jquery object that was clicked
            var bdata = $(this).data("b");
            var tout = bdata == 6 ? 1000 : 1000;
            $(this).attr("style", $(this).data("int"));
            self.panel.button_press(self);
            var mytimer = setTimeout(function () {
                let res = self.reset_button();
                if (res == -1) {console.log("couldn't reset frame");}
                }, tout);
            $(this).data("timer", mytimer);
        });
    },
    get_svg_frame: function(){
        try {
            this.frame = $('#button-' + this.name + '-frame');
        } catch (e) {
            if (e instanceof ReferenceError) {
                console.log("button " + this.name + " undefined in svg file");
                this.frame = undefined;
            }
        }
        try {
            this.on_style = this.frame.attr("style");
            if (this.on_style == undefined) { throw "NoStyle"; }
        } catch (e) {
            if (e == "NoStyle"){
                console.log("button " + this.name + " has no style defined in svg file");
                this.frame = undefined;
            }
        }
    },
    style_frame: function(){
        this.off_style = this.on_style.replace(/stroke-opacity[^;]*;?/, "");
        var int_style;
        if (this.off_style.length > 0) { this.off_style += ';' };
        int_style = this.off_style + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff';
        this.off_style += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
        this.frame.attr("style", this.off_style);
        this.frame.data("b", 0);
        this.frame.data("off", this.off_style);
        this.frame.data("int", int_style);
        this.frame.data("timer", '');
        return 0;
    },
    reset_button: function () {
        if (this.frame == undefined) return -1; // unused button
        if (this.frame.attr("style", this.frame.data("off")) == undefined) return -1; // unused button
        this.frame.attr("style", this.frame.data("off"))
        var mytimer = this.frame.data("timer");
        if (mytimer !== '') {
            clearTimeout(mytimer);
            this.frame.data("timer", '');
        }
        return 0;
    }

});



Slider = ControlElement.extend({
    init: function (name, value) {
        this._super(name, value);
    },
    flipScale: function(){
        
    },
    submit: function(){

    }
})

 LedNotification = PClass.create({
    init: function(name){
        this.name = name;
        this.status = false;
    },
    toggle : function(){this.status = this.status ? false : true;},
    turnOn : function(){this.status = true;},
    turnOff : function(){this.status = false;}
});

/**
 * panel class constructor adds buttons, sliders and notifications into a panel class. This is done outside of the class 
 * so there's more flexibility when creating panels. You pass arrays of buttons, sliders and notifications and then using 
 * method add from panel you add them to the panel. 
 * 
 * you dont create the buttons and then pass them to the panel, you give an array with info necessary to create them
 */

Panel = PClass.create({
    init: function (connection_interface, type, button_array, slider_array, led_array){
        this.dry_run = false;
        this.connection_interface = connection_interface;
        if (connection_interface == undefined){
            console.log("Created panel instance without connection interface, dry_run turned on");
            this.dry_run = true;
        }
        $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
        document.getElementById('canvas').innerHTML = window.frames[type];
        console.log("inserted " + type + " html into DOM");
        this.add_buttons(button_array);
        this.add_sliders(slider_array);
        this.add_leds(led_array);
    },
    add_buttons: function (button_array) {
        let self = this;
        button_array.forEach(function (item) {
            self.button_array.push(new Button(item[0], item[1], self));
        });
    },
    add_sliders: function (slider_array) {
        let self = this;
        slider_array.forEach(function (item) {
            self.slider_array.push(new Slider(item[0], item[1], self));
        });
    },
    add_leds: function (led_array) {
        let self = this;
        led_array.forEach(function (item) {
            self.led_array.push(new LedNotification(item[0], item[1], self));
        });
    },
    button_press: function(button) { // only called by buttons
        if(!this.dry_run){
            this.connection_interface.sendMessage(button.value);
            console.log("sent " + button.value);
        } 
        else
            console.log("DRY_RUN: sent " + button.value)
    }
});


window.onload = function () {   
    
    spaBluetoothConnection = new DeviceBluetooth(SERVICE_UUID, CHARACTERISTIC_UUID_READ);

    spa_button_array = [
        ["system", "s0"],
        ["jetshi", "j0"],
        ["aux", "a0"],
        ["auxii", "a2"],
        ["light", "l0"],
    ];
    sauna_button_array = [
        ["system", "s0"],
        ["light", "l0"],
    ];

    var type = "spa";
    var panel;
    
    // if (type == "spa"){
    //     panel = new Panel(
    //         spaButtons,
    //         spaSliders,
    //         spaNotifications,
    //         spaBluetoothConnection
    //     );
    // }

    // saunaPanelWifi = new SaunaPanel("wifi");

    // $('button-system-frame').on('click', function(){
    //     appPanel.pressButton("system");
    // })

    // $('submit-temp').on('click', function () {
    //     appPanel.getSliderValue("temp");
    // })

    // messageRecievedCallback = function (message) {
    //     status = message.jsonformat();
    //     appPanel.leds["ledjetshi"].status = status.led_jets_hi;
    // }
    // scanner = new BluetoothScanner(); // create scanner object
    // scanner.startScan(); // begin scan and keep relevan findings in array
    // equip = new DeviceBluetooth(SERVICE_UUID, CHARACTERISTIC_UUID_READ); // create device connection
    // equip.connect("AccControl", equip.devices); // connect to a known device that should have been scanned


    var scanning = false;
    var it = 1;
    var deviceName = "";
    $('#scan-loader-animation').hide();
    $("#button-start-stop-scan").on('click', function(){
        if(scanning){
            $('#scan-loader-animation').hide();
            scanning = false;
            // $("#scan-result-list").append('<li> <a class="ui-btn ui-btn-icon-right ui-icon-carat-r">device ' + it + '</a> </li>');
            // it++;
            stopScan();
            $('#button-connect-to-device').addClass("ui-state-disabled");
        }
        else{
            $('#scan-loader-animation').show();
            scanning = true;
            startScan();
        }
    });
    
    $('#scan-result-list').on('click','li', function () {
        $('#button-connect-to-device').removeClass("ui-state-disabled");  
        deviceName = $(this).find("a").text();
    });
    
    $('#button-connect-to-device').on('click', function(){
        btConnect(accDevicesIds[deviceName]);
    });
    
    $("#submit-register-button").on('click', function(){
        $.mobile.changePage("#start-page", { transition: "slidedown", changeHash: false });
        $("#available-systems").prepend('<a data-position-to="window" \
                    class= "device ui-mini ui-btn ui-btn-inline" \
                    data-transition="pop" > New Device</a >');
    });

    $(document).on('click', ".device", function () {
        $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
        setScreen("spa");
    });


}

function setScreen(device) {
    var templims;
    $('#name').html("<h1>Acc " + device.capitalize() + "</h1>");
    document.getElementById('canvas').innerHTML = frames[device];

    if (device == "spa") {
        templims = { f: { min: 45, max: 104 }, c: { min: 7.6, max: 40 } };
        $('#enableSessionTime').hide();
    }
    else if (device == "sauna") {
        templims = { f: { min: 50, max: 160 }, c: { min: 10.3, max: 70.8 } };
        $('#enableSessionTime').show();
    }

    $('#submitTemp').click(function () {
        var temp = $('#slider-1').val();
        alert("you submitted " + temp);
        ws.send(temp);
    });

    $('#submitTsession').click(function () {
        var tsession = $('#slider-2').val();
        alert("you submitted " + tsession);
        ws.send(tsession);
    });

    $('#submitTzone').click(function () {
        var tzone = $('#tz').val();
        alert("you submitted " + tzone);
    });


    $('.form-control').timezones();

    $(".ui-slider-label-b").addClass('ui-btn-active');
    $(".ui-slider-track").css('background', '#22aadd');
    var oldvalue = $("#slider-1").attr("value");


    $('#slider-1').change(function () {
        if ($("#flip-scale").val() == 1) {
            var number = parseFloat(this.value);
            if (!(number <= templims.c.max && number >= templims.c.min)) number = f2c(parseFloat(oldvalue));
            var n10 = ((number - 7.6) * 10).toFixed(0);
            var delta = n10 % 11;
            var base = Math.floor(n10 / 11);
            if (delta > 7) { base++; delta = 0 }
            else if (delta > 3) { delta = 5 }
            else { delta = 0 };
            var sal = base * 11 + delta;
            sal /= 10;
            sal += 7.6;
            $(this).val(sal.toFixed(1));
            var far = 45 + base * 2;
            if (delta) far++;
            $("#slider-F").val(far.toFixed(0));
        }
        else {
            if (!(this.value <= templims.f.max && this.value >= templims.f.min)) this.value = oldvalue;
            $("#slider-F").val(this.value);
        }
    }).change();

    $("#slider-2").change(function () {
        $("#slider-T").val(this.value);
    }).change();

    $("#flip-scale").on("change", function () {
        var scale = this.value;
        var textslider = '';
        if (scale == 0) {
            textslider = 'Slider (°F):';
            $("#slider-1").attr("min", templims.f.min).attr("max", templims.f.max).attr("step", 1).val($("#slider-F").val());
        }
        else {
            textslider = 'Slider (°C):';
            var cval = f2c($("#slider-F").val());
            $("#slider-1").attr("min", templims.c.min).attr("max", templims.c.max).attr("step", .1).val(cval);
        }
        //    $("#slider-label").text(textslider);
    });
    $("#flip-scale").change();
    $("#slider-1").on('tap', function () {
        this.value = ''
    });

    $("#slider-1").bind('blur', function (e) {
        $("#slider-1").change();
    });

    $("#slider-1").on('slidestop', function (e) {
        $("#slider-1").change();
    });


    var mybuttons = { 2: 'aux', 3: 'jets', 4: 'system', 7: 'aux2', 6: 'light' };

    var rects = new Array(5);
    var rid = 0;

    this.resetbuttons = function () {
        for (var rid = 0; rid < 5; rid++) {
            if (rects[rid] == undefined) continue; // unused button
            if (rects[rid].attr("style", rects[rid].data("off")) == undefined) continue; // unused button
            rects[rid].attr("style", rects[rid].data("off"))
            var mytimer = rects[rid].data("timer");
            if (mytimer !== '') {
                clearTimeout(mytimer);
                rects[rid].data("timer", '');
            }
        }
    }


    for (var b in mybuttons) {
        rects[rid] = $('#button-' + mybuttons[b] + '-frame');
        var auxonstyle = rects[rid].attr("style");
        if (auxonstyle == undefined) continue; // unused button
        var auxoffstyle = auxonstyle.replace(/stroke-opacity[^;]*;?/, "");
        var auxintstyle;
        if (auxoffstyle.length > 0) { auxoffstyle += ';' };
        auxintstyle = auxoffstyle + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff';
        auxoffstyle += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
        rects[rid].attr("style", auxoffstyle);
        rects[rid].data("b", b);
        rects[rid].data("off", auxoffstyle);
        rects[rid].data("int", auxintstyle);
        rects[rid].data("timer", '');
        rects[rid].on("click", function () {
            var bdata = $(this).data("b");
            var tout = bdata == 6 ? 1000 : 1000;
            $(this).attr("style", $(this).data("int"));
            var mytimer = setTimeout(function () { this.resetbuttons() }, tout);
            $(this).data("timer", mytimer);
        });
        rid++;
    }
}



function f2c(far) {
    var stepval = far - 45;
    stepval = stepval.toFixed(0);
    var hstepval = Math.floor(stepval / 2);
    var cval = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
    return cval.toFixed(1);
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


function startScan() {
    ble.startScan([], function (device) {
        // console.log(JSON.stringify(device));
        // aux += "<li href='#'>" + JSON.stringify(device) + "</li>";
        // document.getElementById('scanned devices').innerHTML = aux;

        if (device.name == "AccControl") {
            accDevicesIds[device.name] = device.id;
            $("#scan-result-list").append('<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + device.name + '</a> </li>');
        }
    });

}
function btConnect(deviceId) {
    ble.connect(deviceId, function (device) {
        console.log("Connected to " + deviceId);
        ble.write(deviceId,
            SERVICE_UUID,
            CHARACTERISTIC_UUID_READ,
            stringToBytes("Hello from ACC Control remote application, prepare to be conquered."),
            function () { console.log("Sent conquering message"); },
            function () { console.log("Conquering failed"); }
        );
        // location.href = 'index.html#actionpage';
        // setButtons(device);
        // location.href = 'index.html';
    }, function () {
        console.log("Couldn't connect to " + deviceId);
    });
}

function stopScan() {
    ble.stopScan;
    console.log("Scan Stopped");
}

function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}