const EMAIL_MAX_LENGTH = 80;
const WIFI_SSID_MAX_LENGTH = 32;
const WIFI_PASSWD_MAX_LENGTH = 32;

transmitter = {
    types: ["temperature", "session", "keyboard", "time", "wificreds", "btname"],
    send_to_module: function (type, data) {
        let message = data;
        if (!transmitter.types.includes(type)) {
            console.log("error invoking transmitter. invalid type: " + type)
        }
        else { // esto es sumamente optimizable
            if (type == "wificreds") {
                message = transmitter.parse_wificreds(data);
                type = "wificreds";
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
    parse_wificreds: function (data) {
        if (data.ssid.length > WIFI_SSID_MAX_LENGTH) {
            navigator.notification.alert("Invalid Wifi SSID");
            return "error";
        }
        else if (data.passwd.length > WIFI_PASSWD_MAX_LENGTH) {
            navigator.notification.alert("Invalid WiFi password");
            return "error";
        }
        else return data.ssid + '+' + data.passwd;
    }
}