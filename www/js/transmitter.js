transmitter = {
    types: ["temperature", "session", "key", "time", "usertoken", "wificreds"],
    send_to_module: function (type, data) {
        let message = "";
        if (!transmitter.types.includes(type)) {
            console.log("error invoking transmitter. invalid type: " + type)
        }
        else {
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

            transmitter.send_by_bt(type, message);
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
    }
}