const EMAIL_MAX_LENGTH = 80;
const WIFI_SSID_MAX_LENGTH = 32;
const WIFI_PASSWD_MAX_LENGTH = 32;

transmitter = {
    types: ["temperature", "session", "key", "time", "wificreds", "email"],
    send_to_module: function (type, data) {
        let message = "";
        if (!transmitter.types.includes(type)) {
            console.log("error invoking transmitter. invalid type: " + type)
        }
        else { // esto es sumamente optimizable
            if (type == "temperature") {
                message = transmitter.parse_temp(data);
                type = "keyboard";
            }
            else if (type == "time"){
                message = transmitter.parse_time(data);
                type = "keyboard";
            }
            else if (type == "key"){
                message = transmitter.parse_key(data);
                type = "keyboard";
            }
            else if (type == "email"){
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
    parse_temp: function (data) {
        let control_byte = 8;
        if (data.unit === "F")
            control_byte++;
        let queue0 = parseInt(data.val.replace(".","") % 10);
        let queue1 = parseInt(data.val.replace(".","") / 10);
        if (String(queue1).length < 2) queue1 = "0" + queue1;
        if (String(queue0).length < 2) queue0 = "0" + queue0;
        if (String(control_byte).length < 2) control_byte = "0" + control_byte;
        return [queue0,queue1,control_byte];
        // return control_byte + queue1 + queue0;
    },
    parse_time: function(data){
        let control_byte = data.ampm == "pm" ? 0x0E : 0x0C;
        data.hour = data.hour == "00" ? "12" : data.hour;
        if (String(data.hour).length < 2) data.hour = "0" + data.hour;
        if (String(data.minute).length < 2) data.minute = "0" + data.minute;
        return [data.minute, data.hour, control_byte];
    },
    parse_key: function(data) {
        // console.log("send button " + data.key)
        var sbutton;
        switch(data.key){
            case "s0": sbutton = 19; break;
            case "l0": sbutton = 17; break;
            case "x0": sbutton = 18; break;
            case "j0": sbutton = 5; break;
            case "a0": sbutton = 4; break;
        }
        return [sbutton,0,0];
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