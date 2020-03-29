const EMAIL_MAX_LENGTH = 80;
const WIFI_SSID_MAX_LENGTH = 32;
const WIFI_PASSWD_MAX_LENGTH = 32;

transmitter = {
    types: ["temperature", "session", "keyboard", "time"],
    send_to_module: function (type, data) {
        let message = data;
        if (!transmitter.types.includes(type)) {
            console.log("error invoking transmitter. invalid type: " + type)
        }
        else { // esto es sumamente optimizable
            if (type == "time") {
                message = transmitter.parse_time(data);
            }

            if (message !== "error" && window.connected_device) {
                if (connected_device.ws) transmitter.send_by_wifi(type, message);
                else if (connected_device.id) transmitter.send_by_bt(type, message);
            }
        }
    },
    send_by_bt: function (characteristic, message) {
        write_characteristic(characteristic, message);
    },
    send_by_wifi: function (characteristic, message) {
        write_characteristic_wifi(characteristic, message);
    },
    parse_time: function (d) {  // d is already formated AM/PM
        let m = d.match(/(\d+):(\d+)\s+(\w)M/);
        let res = '';
        if (m) {
            let hour = ('0' + m[1]).slice(-2);
            let minute = ('0' + m[2]).slice(-2);
            res += hour + minute + m[3];
        }
        console.log("Recibio: " + d + ", enviara: " + res);
        return res;
    }
}