const EMAIL_MAX_LENGTH = 80;
const WIFI_SSID_MAX_LENGTH = 32;
const WIFI_PASSWD_MAX_LENGTH = 32;

transmitter = {
    types: ["temperature", "session", "keyboard", "time", "wificreds", "email"],
    send_to_module: function (type, data) {
        let message = data;
        if (!transmitter.types.includes(type)) {
            console.log("error invoking transmitter. invalid type: " + type)
        }
        else { // esto es sumamente optimizable
            if (type == "email"){
                message = transmitter.parse_email(data);
                type = "email";
            }
            else if (type == "wificreds"){
                message = transmitter.parse_wificreds(data);
                type = "wificreds";
            }

            if(message !== "error"){
                transmitter.send_by_bt(type, message);
            }
        }
    },
    send_by_bt: function (characteristic, message) {
        bluetooth.send(characteristic, message);
    },
    send_by_wifi: function (type, message) {
        console.log("yet to be implemented");
    },
    parse_email: function(data){
        let re_mail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,}$/i;
        if(!re_mail.test(data) || data.length > EMAIL_MAX_LENGTH){
            navigator.notification.alert("Invalid e-mail");
            return "error";
        }
        else{
            return data;
        }

    },
    parse_wificreds: function(data){
        if(data.ssid.length > WIFI_SSID_MAX_LENGTH){
            navigator.notification.alert("Invalid Wifi SSID");
            return "error";
        }
        else if(data.passwd.length > WIFI_PASSWD_MAX_LENGTH){
            navigator.notification.alert("Invalid WiFi password");
            return "error";
        }
        else return data.ssid + '+' + data.passwd;
    }
}