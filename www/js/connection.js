var SERVICE_UUID = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";

/**
 * Connection Classes:
 * Bluetooth Scanner: Scans devices compatible to equipments. The devices attribute will be used by a DeviceBluetooth to 
 * connect to it. 
 */

var BluetoothScanner = PClass.create({
    init: function (dry_run) {
        this.devices = [];
        this.class_found = "found_devices";
        this.dry_run = dry_run ? dry_run : false;
    },
    scannedDevices: function () {
        return this.devices;
    },
    addDevice: function (name, id) {
        this.devices.push({ name: name, id: id });
    },
    startScan: function (append_list) {
        var self = this;
        if(!this.dry_run){
            ble.isEnabled(function () {
                console.log("bluetooth enabled");
            }, function () {
                console.log("bluetooth disabled");
            });
            ble.startScan([], function (device) {
                if (/Acc/.exec(device.name) !== null) {
                    self.addDevice(device.name, device.id);
                    if (append_list){
                        append_list.append(`<li> <a class="${this.class_found} ui-btn ui-btn-icon-right ui-icon-carat-r">${device.name}</a> </li>`);
                    }
                }
            });
        }
        else{
            append_list.append(`<li> <a class="${this.class_found} ui-btn ui-btn-icon-right ui-icon-carat-r">DryDevice</a> </li>`);
            self.addDevice("DryDevice", "dry_device");
        }
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
    init: function (service_UUID, characteristic_UUID, dry_run) {
        this.service_UUID = service_UUID;
        this.characteristic_UUID = characteristic_UUID;
        this.connected = false;
        this.connect_message = "Hello from ACC Control remote application"
        this.connected_id = "";
        this.recieved_data = "";
        this.dry_run = dry_run ? dry_run : false;
    },
    connect: function (name, devices) {
        console.log("Attempting connection to " + name);
        var id = "";
        if(!this.dry_run){
            for (var i = 0; i < devices.length; i++) {
                if (devices[i].name == name) {
                    id = devices[i].id;
                    console.log("device was found in scanning");
                }
            }
            if (id == "") { console.log("DEVICE NAME WASN'T SCANNED: "); }
        }
        else{
            id = "dry_device";
        }
        let self = this;

        if (!this.dry_run){
            ble.connect(id, function (device) {
                console.log("Connected to " + name);
                self.connected = true;
                self.connected_id = id;
                ble.write(id,
                    self.service_UUID,
                    self.characteristic_UUID,
                    stringToBytes(self.connect_message),
                    function () { console.log("Sent message"); },
                    function () { console.log("failed"); }
                );
            }, function () {
                console.log("Disconnected from " + name);
                alert("bluetooth disconnected");
            });
        }
        else{
            self.connected = true;
            self.connected_id = id;
        }
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
    listenNotifications() {
        let self = this;
        ble.startNotification(this.connected_id,
            this.service_UUID,
            this.characteristic_UUID,
            function (data) {
                self.recieved_data = JSON.stringify(data);
                console.log(`data: ${self.recieved_data}`);
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

// module.exports = {
//     Dry,
//     BluetoothScanner,
//     DeviceBluetooth,
//     DeviceWebSocket,
//     ConnectionInterface
// }

consoleLogReadCallback = function(data) {
    console.log("we have data: " + JSON.stringify(data));
}