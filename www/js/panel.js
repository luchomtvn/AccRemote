let panel = {};

panel.f2c = function (far) {
    var stepval = far - 45;
    stepval = stepval.toFixed(0);
    var hstepval = Math.floor(stepval / 2);
    var cval = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
    return cval.toFixed(1);
}

panel.BluetoothScanner =  class {
    constructor() {
        this.devices = [];
    }
    get scannedDevices() {
        return this.devices;
    }
    addDevice(name, id) {
        this.devices.push({ name: name, id: id });
    }
    startScan() {
        var self = this;
        try { eval("ble"); } // checks if ble was defined
        catch (e) {
            if (e instanceof ReferenceError) { console.log("ble isn't defined"); return -1; }
        }
        if(!ble.isEnabled()) {
            return -1;
        }
        ble.startScan([], function (device) {
            if (device.name == "AccControl") {
                // accDevicesIds[device.name] = device.id;
                self.addDevice(device.name, device.id);
                return 0;
                // $("#scan-result-list").append('<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + device.name + '</a> </li>');
            }
        });
        return 0;
    }
    stopScan() {
        ble.stopScan;
        console.log("Scan Stopped");
    }
}

module.exports = panel;