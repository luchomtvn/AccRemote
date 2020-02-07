transmitter = {
    types: ["keyboard", "usertoken", "wificreds"],
    send_to_module: function (type, data) {
        let message = "";
        if (!transmitter.types.includes(type)) {
            console.log("error invoking transmitter. invalid type: " + type)
        }
        else {
            if (type == "keyboard") {
                message = transmitter.parse_temp(data);
            }


            let session = window.session.getInstance().get();
            
            // ble.isConnected(bluetooth.connected_id,   // if bt is connected, send by bt
            transmitter.send_by_bt(type, message);
                // transmitter.send_by_wifi(type, message)
            // );
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
    }
}