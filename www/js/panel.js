var SERVICE_UUID = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";
var MAX_TEMP_FAR_SAUNA = 160;
var MIN_TEMP_FAR_SAUNA = 50;
var MAX_TEMP_CEL_SAUNA = 70.8;
var MIN_TEMP_CEL_SAUNA = 10.3;
var MAX_TEMP_FAR_SPA = 104;
var MIN_TEMP_FAR_SPA = 45;
var MAX_TEMP_CEL_SPA = 40;
var MIN_TEMP_CEL_SPA = 7.6;
var MAX_SESSION = 60;
var MIN_SESSION = 10;
var accDevicesIds = {};


/**
 * Connection Classes:
 * Bluetooth Scanner: Scans devices compatible to equipments. The devices attribute will be used by a DeviceBluetooth to 
 * connect to it. 
 */

var BluetoothScanner = PClass.create({
    init: function () {
        this.devices = [];
    },
    scannedDevices: function () {
        return this.devices;
    },
    addDevice: function (name, id) {
        this.devices.push({ name: name, id: id });
    },
    startScan: function () {
        var self = this;
        try { eval("ble"); } // checks if ble was defined
        catch (e) {
            if (e instanceof ReferenceError) { console.log("ble isn't defined"); return -1; }
        }
        ble.isEnabled(function () {
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
    stopScan: function () {
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
    sendMessage: function (message) {
        throw new Error("Must be implemented");
    },
    setReadCallback: function (funct) {
        throw new Error("Must be implemented");
    }
});

var Dry = ConnectionInterface.extend({ // just for testing
    sendMessage: function (message) {
        console.log(message);
    },
    setReadCallback: function (funct) { }
})

/**
 * Allows connection to a bluetooth device after scanning, also sets callbacks and write functions. 
 * Extends to ConnectionInterface, so it can be instanciated as such in a panel
 */
var DeviceBluetooth = ConnectionInterface.extend({
    init: function (service_UUID, characteristic_UUID) {
        this.service_UUID = service_UUID;
        this.characteristic_UUID = characteristic_UUID;
        this.connected = false;
        this.connect_message = "Hello from ACC Control remote application, prepare to be conquered."
        this.connected_id = "";
        this.recieved_data = "";
    },
    connect: function (name, devices) {
        console.log("Attempting connection to " + name);
        var id = "";
        for (var i = 0; i < devices.length; i++) {
            if (devices[i].name == name) {
                id = devices[i].id;
                console.log("device was found in scanning");
            }
        }
        if (id == "") { console.log("DEVICE NAME WASN'T SCANNED: "); }
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
    sendMessage: function (message) {
        ble.write(this.connected_id,
            this.service_UUID,
            this.characteristic_UUID,
            stringToBytes(message),
            function () { console.log("Sent: '" + message + "'"); },
            function () { console.log("Couldn't send message"); }
        );
    },
    setReadCallback: function (fnct) {
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
    listen() {
        let self = this;
        ble.read(this.connected_id,
            this.service_UUID,
            this.characteristic_UUID,
            function (data) {
                self.recieved_data = JSON.stringify(data);
            },
            function (failure) {
                console.log("DeviceBluetooth failed to recieve data from characteristic " + self.characteristic_UUID);
            }
        );
    },
    stringToBytes: function (string) {
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
    init: function (url) {
        this.url = url;
        this.ws = (this.url != undefined) ? new WebSocket(this.url) : new WebSocket("ws://127.0.0.1:5555");
    },
    setReadCallback: function (funct) {
        this.ws.onmessage = funct;
    },
    sendMessage: function (message) {
        this.ws.send(message);
    }
});

ControlElement = PClass.create({
    init: function (name, value, connection_interface) {
        this.name = name;
        this.value = value;
        this.connection_interface = connection_interface;
        this.jquery_obj = "";
    },
    get_selector: function (svg) {
        throw new Error("Must be implemented");
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
    init: function (name, value, connection_interface) {
        this._super(name, value, connection_interface);
        this.on_style = "";
        if (this.get_selector()) {
            console.log("button " + this.name + " linked to panel");
            this.on_style = this.jquery_obj.attr("style");
            this.style_frame();
            this.click_event();
        }
        else
            console.log("created button without graphic bind, clicking will have no effect");
    },
    get_selector: function () {
        try {
            this.jquery_obj = $('#button-' + this.name + '-frame');
        } catch (e) {
            if (e instanceof ReferenceError)
                console.log("button 'button-" + this.name + "-frame' not in svg or html file");
            else
                console.log("couldn't find jquery object in html file: " + e);
        }
        return this.jquery_obj == undefined ? false : true;
    },
    click_event: function () {
        let self = this;
        this.jquery_obj.on("click", function () { // inside the function, 'this' is the jquery object that was clicked
            var bdata = $(this).data("b");
            var tout = bdata == 6 ? 1000 : 1000;
            $(this).attr("style", $(this).data("int"));
            self.connection_interface.sendMessage(self.value);
            var mytimer = setTimeout(function () {
                let res = self.reset_button();
                if (res == -1) { console.log("couldn't reset frame"); }
            }, tout);
            $(this).data("timer", mytimer);
        });
    },
    style_frame: function () {
        let off_style = this.on_style.replace(/stroke-opacity[^;]*;?/, "");
        if (off_style.length > 0) { off_style += ';' };
        off_style += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
        this.jquery_obj.attr("style", off_style);
        this.jquery_obj.data("b", 0);
        this.jquery_obj.data("off", off_style);
        this.jquery_obj.data("int", off_style + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff');
        this.jquery_obj.data("timer", '');
        return 0;
    },
    reset_button: function () {
        if (this.jquery_obj == undefined) return -1; // unused button
        if (this.jquery_obj.attr("style", this.jquery_obj.data("off")) == undefined) return -1; // unused button
        this.jquery_obj.attr("style", this.jquery_obj.data("off"))
        var mytimer = this.jquery_obj.data("timer");
        if (mytimer !== '') {
            clearTimeout(mytimer);
            this.jquery_obj.data("timer", '');
        }
        return 0;
    }

});


Slider = ControlElement.extend({
    init: function (name, start_value, max, min, connection_interface) {
        this._super(name, 0, connection_interface);
        this.max = max;
        this.min = min;
        this.start_value = start_value;
        this.jquery_obj = $("#slider-" + this.name);
        this.jquery_obj_2 = $("#slider-2-" + this.name);
        this.jquery_obj_submit = $("#submit-" + this.name);
        if (this.jquery_obj != undefined && this.jquery_obj_2 != undefined && this.jquery_obj_submit != undefined) {
            console.log("slider " + this.name + " linked to panel")
            this.jquery_obj.attr("min", this.min);
            this.jquery_obj.attr("max", this.max);
            let self = this;
            this.onChange = function () {
                self.jquery_obj.val(this.value);
            }
            this.jquery_obj_submit.click(function () {
                self.connection_interface.sendMessage(self.jquery_obj.val());
            });
        }
        else { console.log("slider " + this.name + " unlinked"); }
    },
    submit: function () {
        this.connection_interface.sendMessage(this.jquery_obj.val());
    },
    set_change_function: function () {
        this.jquery_obj.change(this.onChange).change();
    }
});

SliderTemp = Slider.extend({
    init: function (name, start_value, maxF, minF, maxC, minC, connection_interface, flip_scale) {
        this._super(name, start_value, maxF, minF, connection_interface);
        this.minF = minF;
        this.maxF = maxF;
        this.minC = minC;
        this.maxC = maxC;
        this.flip_scale = flip_scale;
        this.slider_label = $("#slider-label");
        let self = this;
        this.flip_scale.on("change", function () {
            var scale = this.value;
            var textslider = '';
            if (scale == 0) {
                textslider = 'Slider (°F):';
                self.jquery_obj.attr("min", self.minF).attr("max", self.maxF).attr("step", 1).val(self.jquery_obj_2.val());
            }
            else {
                textslider = 'Slider (°C):';
                var cval = f2c(self.jquery_obj_2.val());
                self.jquery_obj.attr("min", self.minC).attr("max", self.maxC).attr("step", .1).val(cval);
            }
            self.slider_label.text(textslider);
        });
        this.flip_scale.change();
        this.onChange = function () {
            var oldvalue = self.jquery_obj.attr("value");
            if (self.flip_scale.val() == 1) {
                var number = parseFloat(this.value);
                if (!(number <= self.maxC && number >= self.minC)) number = f2c(parseFloat(oldvalue));
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
                self.jquery_obj_2.val(far.toFixed(0));
            }
            else {
                if (!(this.value <= self.maxF && this.value >= self.minF)) this.value = oldvalue;
                self.jquery_obj_2.val(this.value);
            }
        }
    }
});

LedNotification = PClass.create({
    init: function (name) {
        this.name = name;
        this.status = false;
    },
    toggle: function () { this.status = this.status ? false : true; },
    turnOn: function () { this.status = true; },
    turnOff: function () { this.status = false; }
});

TimeZoneSelector = PClass.create({
    init: function (name, form_class, submit, connection_interface) {
        this.name = name;
        this.connection_interface = connection_interface;
        this.jquery_obj = $("#" + this.name)
        this.form_class = $("." + form_class);
        this.submit = $("#" + submit);
        let self = this;
        if (this.submit != undefined && this.form_class != undefined && this.jquery_obj != undefined) {
            this.submit.click(function () {
                self.connection_interface.sendMessage(self.jquery_obj.val());
            });
            this.form_class.timezones();
        }
    }

});

exports = {
    allowClasses,
    BluetoothScanner,
    DeviceBluetooth,
    DeviceWebSocket,
    ConnectionInterface,
    ControlElement,
    Button,
    Slider,
    SliderTemp,
    TimeZoneSelector,
    LedNotification
};