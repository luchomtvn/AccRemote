var SERVICE_UUID = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";
var SERVER_URL = "ws://127.0.0.1:5555";

var globals = {
    dry_run: false
}

/**
 * Connection classes: 
 */

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


/**
 * BluetoothModule: Class
 * Inherits from connection interface. Permits bluetooth scanning and connection using mobile device's bluetooth
 * to connect to a spa or sauna. 
 */

var BluetoothModule = ConnectionInterface.extend({
    init: function (service_uuid, characteristic_uuid) {
        this.scanner = {
            status       : false,   // scanning or not
            found_devices: [],
        }
        this.connection          = {
            status             : false,
            id                 : "",
            data               : {},
            service_UUID       : service_uuid,
            characteristic_UUID: characteristic_uuid
        }
    },
    readyToScan: function() {
        let ready;
        if(globals.dry_run) return true;
        else{
            ble.isEnabled(function () {
                ready = true;
            },
            function(){
                ready = false;
            });
            return ready;
        }
    },
    startScan: function (callback) {
        let self = this;
        if (!globals.dry_run) {
            ble.isEnabled(function () {  // isEnabled is for android only
                console.log("bluetooth enabled");
            }, function () {
                console.log("bluetooth disabled");
            });
            self.scanner.status = true;
            ble.startScan([], callback);
        }
        else {
            self.add_scanned_device("TEST_DEVICE_1", "12345");
            $(navigation.available_devices.available_devices_list).append(
                `<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">
                        TEST_DEVICE_1</a> </li>`);
            self.add_scanned_device("TEST_DEVICE_2", "54321");
            $(navigation.available_devices.available_devices_list).append(
                `<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">
                        TEST_DEVICE_2</a> </li>`);
        }
    },
    add_scanned_device: function(name_,id_){
        this.scanner.found_devices.push({
            name: name_,
            id: id_
        });
    },
    stopScan: function () {
        if(!globals.dry_run)
            ble.stopScan;
        console.log("Scan Stopped");
        this.scanner.status = false;
    },
    get_id: function (name) {
        for (var i = 0; i < this.scanner.found_devices.length; i++) {
            if (this.scanner.found_devices[i].name == name) {
                console.log(`returning id for ${name}`);
                return this.scanner.found_devices[i].id;
            }
        }
        console.error(`Did not return id. ${name} was not found in scanner result list`)
        return undefined;
    },
    connect: function (device_name, connection_callback) {
        if (this.connected)
        console.log("already connected");
        else {
            let device_id = this.get_id(device_name);
            if (!globals.dry_run) {
                let self = this;
                ble.connect(device_id, connection_callback, function () {
                    console.log("Disconnected from " + device_id);
                    alert("bluetooth disconnected");
                });
            } else {
                this.connection.status = true;
                this.connection.id = device_id;
                console.log(`connected to device id ${device_id} (dry run)`);
            }
        }
    },
    disconnect: function() {
        let self = this;
        ble.disconnect(this.connection.id, function(){
            self.connection.status = false;
            self.connection.id = "";
            self.connection.service_UUID = "";
            self.connection.characteristic_UUID = "";
        },function() {
            console.error(`Couldn't disconnect from ${self.connection.id}`);
        })
    },
    sendMessage: function (message) {
        if(this.connection.status){
            ble.write(this.connection.id,
                this.connection.service_UUID,
                this.connection.characteristic_UUID,
                stringToBytes(message),
                function () {
                    console.log("Sent: '" + message + "'");
                },
                function () {
                    console.log("Couldn't send message");
                }
            );
        }
        else
            console.error("Device isn't connected");
    },
    setReadCallback: function (fnct) {
        if(this.connection.status){
            let self = this;
            ble.read(this.connection.id,
                this.connection.service_UUID,
                this.connection.characteristic_UUID,
                fnct,
                function (failure) {
                    console.log("Not recieving from custom callback in characteristic: " + self.characteristic_UUID);
                }
                );
        }
        else
            console.error("Device isn't connected");
    },
    listenNotifications: function() {
        let self = this;
        ble.startNotification(this.connected_id,
            this.connection.service_UUID,
            this.connection.characteristic_UUID,
            function (data) {
                self.recieved_data = JSON.stringify(data);
                console.log(`data: ${self.recieved_data}`);
            },
            function (failure) {
                console.log("DeviceBluetooth failed to recieve data from characteristic " + self.characteristic_UUID);
            }
        );
    }
});


var Dry = ConnectionInterface.extend({ // just for testing
    sendMessage: function (message) {
        console.log(message);
    },
    setReadCallback: function (funct) { }
})

/**
 * Simple Class wrapper for JavaScript websockets, it's main purpose is to have a class that extends from ConnectionInterface
 * and permits a panel to instanciate it inside it's constructor. 
 */
var WebSocketModule = ConnectionInterface.extend({
    init: function (url) {
        this.url = url;
        if(!globals.dry_run)
            this.ws = (this.url != undefined) ? new WebSocket(this.url) : new WebSocket("ws://127.0.0.1:5555");
    },
    setReadCallback: function (funct) {
            this.ws.onmessage = funct;
    },
    sendMessage: function (message) {
        if(!globals.dry_run)
            this.ws.send(message);
        else{
            console.log(`sent '${message}' via websocket (dry_run)`);
        }
    },
    sendJson: function (data) {
        if (!globals.dry_run)
            this.ws.send(data);
        else {
            console.log(`sent '${JSON.stringify(data)}' via websocket (dry_run)`);
        }
    }
});

consoleLogReadCallback = function (data) {
    console.log("we have data: " + JSON.stringify(data));
}

 stringToBytes = function (string) {
     var array = new Uint8Array(string.length);
     for (var i = 0, l = string.length; i < l; i++) {
         array[i] = string.charCodeAt(i);
     }
     return array.buffer;
 }