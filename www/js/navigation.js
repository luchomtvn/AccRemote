var navigation = {
    available_devices: {
        available_devices_list: "available-devices-list",
        button_add_new_device : "button-add-new-device",
        button_class          : "device_button"
    },
    connection_page: {
        scan_loader_animation   : "scan-loader-animation",
        button_start_stop_scan  : "button-start-stop-scan",
        scan_result_list        : "scan-result-list",
        button_connect_to_device: "button-connect-to-device"
    },
    registration_page: {
        page_id               : "registration-page",
        ssid                  : "ssid",
        ssid_pw               : "ssid-pw",
        email_address         : "email-address",
        email_address_confirm : "email-address_confirm",
        submit_register_button: "submit-register-button"
    }
}

var registration_data = {
    device_name: "",
    wifi_ssid: "",
    wifi_passwd: "",
    user_email: ""
}

AvailableDevices = PClass.create({
    init: function (available_devices) {
        this.available_devices          = [];

        let self = this;
        $("." + navigation.available_devices_list.button_class).on('click', function(){
            let button_name = this.innerHTML;
        });
        $("#" + navigation.available_devices_list.button_add_new_device).on('click', function() {
            self.add_new_device()
        });

    },
    add_device: function (name) {
        $("#" + navigation.available_devices_list.available_devices).prepend(`<a data-position-to="window" class= "${this.button_class} device ui-mini ui-btn ui-btn-inline" \
                                    data-transition="pop">${name}</a>`);
        this.added_devices.push(name);
    }
});


bt_module = new BluetoothModule(SERVICE_UUID_CONFIG, CHARACTERISTIC_UUID_CONFIG_SETWIFI);
ws_module = new WebSocketModule(SERVER_URL, true);

window.onload = function () {

    var buttons = {
        connect_new_device : function () {
            $.mobile.changePage("#connect-new-device", { transition: "slidedown", changeHash: false });
        },
        set_device_wifi: function () {
            $.mobile.changePage("#set-device-wifi", { transition: "slidedown", changeHash: false });
        },
        local_access: function () {
            document.getElementById('canvas-bt').innerHTML = window.frames["spa_bluetooth"];
            local_panel.link_buttons();
            $.mobile.changePage("#control-page-bt", { transition: "slidedown", changeHash: false });
        }
    }

    var bluetooth = {
        scanned_devices : [],
        device_to_connect,
        select_scanned_device : function() {
            $("#button-connect-to-device").removeClass("ui-state-disabled");
            bluetooth.device_to_connect = $(this).find("a").text();
        },
        scan_and_add : function() {
            ble.startScan([], function (device) {
                if (/Acc/.exec(device.name) !== null) {
                    // bt_module.add_scanned_device(device.name, device.id);
                    console.log("Device found: " + device.name);
                    bluetooth.scanned_devices.push(device);
                    $("#scan-result-list").append(`<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">${device.name}</a> </li>`);
                    ble.stopScan(function () { console.log("stopped scanning") }, function () { console.log("couldn't stop scanning") });
                }
            }, function () {
                alert("Could not scan (maybe Bluetooth is off?)");
                console.log("Could not scan (maybe Bluetooth is off?)");
            });
        },
        connect_to_device: function () {
            // device_id = bt_module.get_id(bluetooth.device_to_connect);
            console.log("Connecting...");
            ble.connect(bluetooth.get_id(bluetooth.device_to_connect), 
            function () {
                bluetooth.connected_id = bluetooth.get_id(bluetooth.device_to_connect);
                console.log("Connected to device id " + bluetooth.connected_id);
                alert("Connected!");
                // $.mobile.changePage("#registration-page", {transition: "slidedown",changeHash: false});
            }, 
            function () {
                // disable local use
                console.log("Disconnected from " + bluetooth.connected_id);
                alert("bluetooth disconnected");
                // $.mobile.changePage("#connection-page", { transition: "slidedown", changeHash: false });
            });
        },
        get_id: function (name) {
            for (var i = 0; i < bluetooth.scanned_devices.length; i++) {
                if (bluetooth.scanned_devices[i].name == name) {
                    console.log(`returning id for ${name}`);
                    return bluetooth.scanned_devices[i].id;
                }
            }
            console.error(`Did not return id. ${name} was not found in scanner result list`)
            return undefined;
        },
        stringToBytes : function (string) {
            var array = new Uint8Array(string.length);
            for (var i = 0, l = string.length; i < l; i++) {
                array[i] = string.charCodeAt(i);
            }
            return array.buffer;
        }
    }

    var wifi = {
        select_scanned_network : function () {
            // $("#button-connect-to-device").removeClass("ui-state-disabled");
            $("ssid").value = $(this).find("a").text();
        },
        scan_networks_on_device : function () {
            if(ble.isConnected()){

            }
        }
    }
    //main page buttons
    $("#connect-new-device").on('click', buttons.connect_new_device);
    $("#set-device-wifi").on('click', buttons.set_device_wifi);
    $("#local-use").on('click', buttons.local_access);

    //bluetooth
    $("#button-start-stop-scan").on('click', bluetooth.scan_and_add);
    $('#button-connect-to-device').on('click', bluetooth.connect_to_device);
    $("#scan-result-list").on('click', 'li', bluetooth.select_scanned_device);

    //set wifi buttons
    $("#wifi-scan-result-list").on('click', wifi.select_scanned_network);
    $("#scan-wifi-networks-in-device").on('click', wifi.scan_networks_on_device);
    // globals.dry_run = false;
    // all the "frontend" processes driven by events such as clicks and callbacks

    //Click Events
    
    //Add new device
    $('#button-add-new-device').on('click', function () {
    $.mobile.changePage("#connection-page", { transition: "slidedown", changeHash: false });
    $("#scan-loader-animation").hide();

    });

    // $('#button-start-stop-scan').on('click', function() {
    //     if (bt_module.scanner.status) { // scanning
    //         bt_module.stopScan();
    //         $("#scan-loader-animation").hide();
    //     }
    //     else{ // not scanning
    //         if (bt_module.connection.status){ //connected
    //             if(confirm('Bluetooth is already connected, press OK to disconnect')){
    //                 bt_module.disconnect();
    //             }
    //         }
    //         else{ // bt not connected  // TODO: SHOULD CHECK IF BLUETOOTH IS ON
    //             // if (!bt_module.readyToScan())
    //             // alert("Please turn on Bluetooth on mobile device");
    //             // else { // bluetooth ON
    //             bt_module.startScan(function (device) {
    //                 if (/Acc/.exec(device.name) !== null) {
    //                     bt_module.add_scanned_device(device.name, device.id);
    //                     $("#scan-result-list").append(
    //                         `<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">${device.name}</a> </li>`);
    //                 }
    //             });
    //             $("#scan-loader-animation").show();
    //             // }
    //         }
    //     }
    // });
    var device_to_connect;

    // $("#scan-result-list").on('click', 'li', function () {
    //     $("#button-connect-to-device").removeClass("ui-state-disabled");
    //     registration_data.device_name = $(this).find("a").text();
    // });

    // $('#button-connect-to-device').on('click', function() {
    //     device_id = bt_module.get_id(registration_data.device_name);
    //     console.log("Connecting...");
    //     bt_module.connect(registration_data.device_name, 
    //     function () {
    //         bt_module.connection.status = true;
    //         bt_module.connection.id = device_id;
    //         console.log("Connected to device id " + device_id);
    //         alert("Connected!");
    //         $.mobile.changePage("#registration-page", {transition: "slidedown",changeHash: false});
    //     }, 
    //     function () {
    //         console.log("Disconnected from " + device_id);
    //         alert("bluetooth disconnected");
    //         $.mobile.changePage("#connection-page", { transition: "slidedown", changeHash: false });
    //     });
    // });

    // ble.connect(device_id, function () {
    //     bt_module.connection.status = true;
    //     bt_module.connection.id = device_id;
    //     console.log("Connected to device id " + device_id);
    //     alert("Connected!");
    //     $.mobile.changePage("#registration-page", { transition: "slidedown", changeHash: false });
    // }, function () {
    //     console.log("Disconnected from " + device_id);
    //     alert("bluetooth disconnected");
    //     $.mobile.changePage("#connection-page", { transition: "slidedown", changeHash: false });
    // });


    $('#button-submit-register-button').on('click', function() {
        if (!$("#ssid").val() || !$("#ssid-pw").val() || 
            !$("#email-address").val() || !$("#email-address-confirm").val())
            alert("Please fill in all the fields");
        else if ($("#email-address").val() !== $("#email-address-confirm").val())
            alert("E-mails do not match");
        else {
            // alert("Sending data to server");
            registration_data.wifi_ssid = $('#ssid').val();
            registration_data.wifi_passwd = $('#ssid-pw').val();
            registration_data.user_email = $('#email-address').val();

            bt_module.sendJson(registration_data, CHARACTERISTIC_UUID_READ);

            // poll response
            let clear_error_value = function() {
                ble.write(bt_module.connection.id, SERVICE_UUID, CHARACTERISTIC_UUID_ERROR, 0, function (){},
                function(){console.log("couldn't write")});
            }
            let continue_interval = true;
            let read_value = function (data) {
                let value = String.fromCharCode.apply(null, new Uint8Array(data));
                    if (value === "1") { // expected behaviour
                        console.log("Spa Registered Correctly");
                        alert("Spa Registered Correctly");
                        clear_error_value();
                        continue_interval = false;
                    }
                    else if (value === "2") { // wifi problem
                        console.log("Can't connect to WiFi");
                        alert("Could not connect to WiFi")
                        clear_error_value();
                        continue_interval = false;
                    }
                    else if (value === "3") { // server problem
                        console.log("Can't connect to Server");
                        alert("Can't connect to Server");
                        clear_error_value();
                        continue_interval = false;
                    }
                    else if (poll_timeout === 0) {
                        alert("Timeout waiting for spa to connect to wiFi");
                        console.log("Timeout waiting for spa to connect to wiFi");
                        clear_error_value();
                        continue_interval = false;
                    }
            };
            let read_value_error = function() {
                console.log("Couldn't read value from error characteristic");
            };
            let timeout = 100;
            let poll_response = setInterval(() => {
                if(continue_interval){
                    // ble.read(bluetooth.connected_id, CHARACTERISTIC_UUID_ERROR, read_value, read_value_error);
                    timeout --;
                    if(timeout == 0){
                        clearInterval(poll_response);
                        timeout = 100;
                    } 
                }
                else{
                    clearInterval(poll_response);
                }
            }, 500);
            

            // $.mobile.changePage("#listed_devices", { transition: "slidedown", changeHash: false });
            // alert("Device registered!");
            // $("#available-devices").prepend(`<a data-position-to="window" \
            //     class= "device ui-mini ui-btn ui-btn-inline" \
            //     data-transition="pop" > ${registration_data.device_name} </a >`);
        }

    });

    $('.device').on('click', function() {
        // try to connect to device via wi-fi, then change to panel-view
        $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
    });

var bt_callbacks = {
        success : function() {
            console.log("sent message");
        },
        failure : function() {
            console.log("failed to send message");
        }
    };


    // document.getElementById('canvas-bt').innerHTML = window.frames["spa_bluetooth"];
    // $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
var local_panel = {
    buttons : { 2: 'aux', 3: 'jets', 4: 'system', 7: 'aux2', 6: 'light', 8: 'time-down', 9: 'temp-up'},
    reset_buttons : function() {
        for (var b in local_panel.buttons) {        
            $("#button-" + buttons[b] + "-frame").attr("style", $("#button-" + buttons[b] + "-frame").data("off"));
            var mytimer = $("#button-" + buttons[b] + "-frame").data("timer");
            if (mytimer !== '') {
                clearTimeout(mytimer);
                $("#button-" + buttons[b] + "-frame").data("timer", '');
            }
        }
    },
    link_buttons : function() {

        for (var b in local_panel.buttons){
            let on_style = $("#button-" + local_panel.buttons[b] + "-frame").attr("style");
            if (on_style == undefined) continue; // unused button
            let off_style = on_style.replace(/stroke-opacity[^;]*;?/, "");
            if (off_style.length > 0) { off_style += ';' };
            off_style += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
            $("#button-" + local_panel.buttons[b] + "-frame").attr("style", off_style);
            // $("#button-" + local_panel.buttons[b] + "-frame").data("b", 0);
            $("#button-" + local_panel.buttons[b] + "-frame").data("off", off_style);
            $("#button-" + local_panel.buttons[b] + "-frame").data("int", off_style + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff');
            $("#button-" + local_panel.buttons[b] + "-frame").data("timer", '');
            let message = local_panel.buttons[b];

            $("#button-" + local_panel.buttons[b] + "-frame").on("click", function () { // inside the function, 'this' is the html object that was clicked
                // var bdata = $(this).data("b");
                // var tout = bdata == 6 ? 1000 : 1000;
                var tout = 1000;
                $(this).attr("style", $(this).data("int"));
                ble.write(bluetooth.connected_id, SERVICE_UUID_OPERATE, CHARACTERISTIC_UUID_OPERATE_ONOFF,
                        bluetooth.stringToBytes(message), bt_callbacks.success, bt_callbacks.failure);
                let self = this;
                var mytimer = setTimeout( function () {
                    $(self).attr("style", off_style);
                }, tout);
                $(this).data("timer", mytimer);
            });

        }

    }
}





    // // var button_system  = new Button("system", "s0", bt_module);
    // var button_light   = new Button("light", "l0", bt_module);
    // var slider_session = new Slider("session", 10, MAX_SESSION, MIN_SESSION, bt_module);
    // var slider_temp    = new SliderTemp("temp",
    //                                     50,
    //                                     MAX_TEMP_FAR_SPA,
    //                                     MIN_TEMP_FAR_SPA,
    //                                     MAX_TEMP_CEL_SPA,
    //                                     MIN_TEMP_CEL_SPA,
    //                                     bt_module,
    //                                     $("#flip-scale"));
    // slider_session.set_change_function();
    // slider_temp.set_change_function();

    // new TimeZoneSelector("time-zone-selector", "form-timezones", "submit-time-zone", bt_module);

    // $(document).on('click', ".device", function () {
    //     $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
    //     setScreen("spa");
    // });


}