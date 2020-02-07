

var refresh;
var pool_interval = 500; // ms for pool BT screen

const MODES = {
    LOCAL: 'local',
    REMOTE: 'remote'
};

window.onload = function () {

    // page events

    $("#submit-email").on('click', function() {
        if (!registration.re_mail.test(String($("#txt-email-address").val()).toLowerCase()))
            alert("Wrong E-Mail format");
        else{
            // TODO: do a POST to server setting new user and getting final_token. after getting final_token, notify user to check e-mail
            let user = {
                email: $("#txt-email-address").val(),
                final_token: "12345678901234567890",
                creation_date: Date.now(),
                devices: window.devices.dev_unit
            };
            window.session.getInstance().set(user);
            $.mobile.changePage("#main-page", { transition: "slidedown", changeHash: false });

        }
    });

    window.handleOpenURL = function(url) {
        $.mobile.changePage("#register-new-device", { transition: "slidedown", changeHash: false });
        autofill_registered(url);
    }

    window.autofill_registered = function(url){
        params = new URLSearchParams(url.split("?", 2)[1]);
        code = params.get("code");
        $("#code-20-digits").val(code);
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#submit-20-digit-code").offset().top
        }, 700);
    }

    let type = "spa";

    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';
    $.mobile.buttonMarkup.hoverDelay = 0;

    window.panel.load_device();


    $("#time-zone-selector").timezones();

    window.websocket = {
        ws: null,
        url: "ws://localhost:3001/spa/HrU6CUAaSlsB9r0jxJTWr1Bzt7f032_0KVKfHy5IT9jGrtbs/wsa",
        onMessageCallback: function(msg) {
            console.log(msg);
            let screen = JSON.parse(msg.data).dsp;
            window.panel.display(screen);
        },
        openCallback: function() {
            console.log("WebSocket open on server");
        }
    }

    window.bluetooth = {
        write_cb: {
            success: function(){console.log("bluetooth success write ")},
            failure: function(){console.log("bluetooth failure write ")}
        },
        scanned_devices: [],
        device_to_connect: "",
        select_scanned_device: function () {
            $("#button-connect-to-device").removeClass("ui-state-disabled");
            bluetooth.device_to_connect = $(this).find("a").text();
        },
        scan_and_add: function () {
            // $("#scan-result-list").empty();
            ble.isEnabled(
                function () {
                    $("#scan-result-list").empty();
                    bluetooth.scanned_devices = [];
                    ble.startScan([], function (device) {
                        if (/Acc/.exec(device.name) !== null) {
                            console.log("Device found: " + device.name);
                            bluetooth.scanned_devices.push(device);
                            $("#scan-result-list").append(`<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">${device.name}</a> </li>`);
                        }
                    }, function () {
                        alert("Could not scan");
                        console.log("Could not scan");
                    });
                    setTimeout(() => {
                        ble.stopScan(function () { console.log("stopped scanning") }, function () { console.log("couldn't stop scanning") });
                    }, 5000);
                },
                function () {
                    alert("Bluetooth is disabled");
                }
            )
        },
        connect_to_device: function (device_id) {
            ble.isEnabled(
                function () {
                    ble.isConnected(bluetooth.connected_id,
                        function () {
                            alert("BT Already Connected");
                        },
                        function () {
                            console.log("Connecting...");
                            ble.connect(device_id,
                                function () {
                                    bluetooth.connected_id = device_id;
                                    console.log("Connected to device id " + bluetooth.connected_id);
                                    let session = window.session.getInstance().get();
                                    bluetooth.send_usertoken(session.final_token);
                                    if (!window.devices.hasDevice(device_id))
                                        window.devices.add_device(bluetooth.device_to_connect, device_id);
                                    alert("BT Connected!");
                                    window.panel.start_refresh();
                                },
                                function () {
                                    // disable local use
                                    console.log("Disconnected from " + bluetooth.connected_id);
                                    alert("BT Disconnected!");
                                    window.panel.stop_refresh();
                                });
                        }
                    );
                },
                function () {
                    alert("Bluetooth Disabled!");
                }
            )
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
        stringToBytes: function (string) {
            var array = new Uint8Array(string.length);
            for (var i = 0, l = string.length; i < l; i++) {
                array[i] = string.charCodeAt(i);
            }
            return array.buffer;
        }, 
        arrayToBytes: function (arr) {
            var bytearray = new Uint8Array(arr.length);
            for (var i = 0; i < arr.length; i++) {
                bytearray[i] = arr[i];
            }
            return bytearray.buffer;
        },   
        disconnect_from_device: function () {
            ble.disconnect(bluetooth.connected_id,
                function () {
                    console.log("BT Disconnected!");
                    alert("BT Disconnected!");
                    window.panel.stop_refresh();
                },
                function () {
                    // disable local use
                    window.panel.stop_refresh();
                    alert("Error Disconnecting");
                    console.log("Error Disconnecting");
                });
        },
        writeFailure: function() {
            console.log("Couldn't write to module by bluetooth");
        },
        send_keyboard: function(keys_info){

            ble.write(bluetooth.connected_id, 
                SERVICE_UUID_OPERATION,
                CHARACTERISTIC_UUID_KEYBOARD,
                bluetooth.arrayToBytes(keys_info),
                function() {
                    console.log("sent keyboard: " + keys_info)
                },
                bluetooth.writeFailure
            );
        },
        send_wificreds: function (wificreds) {
            ble.write(bluetooth.connected_id,
                SERVICE_UUID_OPERATION,
                CHARACTERISTIC_UUID_WIFICREDS,
                bluetooth.stringToBytes(wificreds),
                function () {
                    console.log("sent wificreds: " + wificreds)
                },
                bluetooth.writeFailure
            );
        },
        send_usertoken: function (usertoken) {
            ble.write(bluetooth.connected_id,
                SERVICE_UUID_OPERATION,
                CHARACTERISTIC_UUID_USERTOKEN,
                bluetooth.stringToBytes(usertoken),
                function () {
                    console.log("sent usertoken: " + usertoken)
                },
                bluetooth.writeFailure
            );
        },
        send: function (characteristic, message) {
            ble.isConnected(bluetooth.connected_id,
                function(){
                    window["bluetooth"]["send_" + characteristic](message);
                },
                function(){
                    console.log("Bluetooth disconnected");
                })
        },
        read_characteristic: function (characteristic){
            ble.isConnected(bluetooth.connected_id, 
                function(){
                    ble.read(bluetooth.connected_id, SERVICE_UUID_OPERATION, characteristic,
                        function (data) {
                            let data_read = Array.from(new Uint8Array(data), 
                                        function(item) { 
                                            hex_num = item.toString(16);
                                            return hex_num.length > 1 ? hex_num : hex_num + "0";
                                        }).join('');
                            console.log("read data from characteristic: " + data_read);
                        },
                        function(){
                            console.log("couldn't read from characteristic");
                        }
                    )
                },
                function(){
                    console.log("bluetooth not connected");
            });
        },
        subscribe_to_characteristic: function(characteristic){
            ble.isConnected(bluetooth.connected_id,
                function () {
                    ble.startNotification(bluetooth.connected_id, SERVICE_UUID_OPERATION, characteristic,
                        function (data) {
                            let data_read = Array.from(new Uint8Array(data), 
                                        function(item) { 
                                            hex_num = item.toString(16);
                                            return hex_num.length > 1 ? hex_num : hex_num + "0";
                                        }).join('');
                            console.log("read data from characteristic: " + data_read);
                        },
                        function () {
                            console.log("couldn't read from characteristic");
                        }
                    )
                },
                function () {
                    console.log("bluetooth not connected");
                });
        }
    }



    stop_screen = function () {
        if (!window.refresh_screen_loop)
            clearInterval(window.refresh_screen_loop);
    }

    window.wifi = {
        module_connected: false,
        select_scanned_network: function () {
            $("#ssid").val($(this).find("a").text());
        },
        scan_networks_on_device: function () {
            ble.isConnected(bluetooth.connected_id,
                function () {
                    ble.write(bluetooth.connected_id,
                        SERVICE_UUID_WIFI,
                        CHARACTERISTIC_UUID_WIFI_SCAN,
                        stringToBytes("SCAN"),
                        function () { console.log("Scanning on module..."); },
                        function () { console.log("Couldn't send scan command"); }
                    );
                    setTimeout(() => {
                    }, 1000);
                    ble.read(bluetooth.connected_id,
                        SERVICE_UUID_WIFI,
                        CHARACTERISTIC_UUID_WIFI_SCAN,
                        function (data) {
                            $("#wifi-scan-result-list").empty();
                            let scan_list = Array.from(new Uint8Array(data),
                                function (item) {
                                    hex_num = item.toString(16);
                                    return hex_num.length > 1 ? hex_num : hex_num + "0";
                                }).join('');
                            if (scan_list === "") {
                                alert("No networks found");
                            }
                            else {
                                scan_list.split(",").forEach(function (item) {
                                    $("#wifi-scan-result-list").append(`<li> <a class="found-network ui-btn ui-btn-icon-right ui-icon-carat-r">${item}</a> </li>`);
                                });
                            }
                        },
                        function () {
                            console.log("couldn't read value");
                        });
                },
                function () {
                    alert("Bluetooth not connected");
                });
        },
        connect_device_to_wifi: function () {
            wifi_data = {
                "wifi_ssid": $("#ssid").val(),
                "wifi_passwd": $("#ssid-pw").val()
            }
            ble.isConnected(bluetooth.connected_id,
                function () {
                    ble.write(bluetooth.connected_id,
                        SERVICE_UUID_WIFI,
                        CHARACTERISTIC_UUID_WIFI_SET,
                        stringToBytes(JSON.stringify(wifi_data)),
                        function () { console.log("Sent wifi data"); },
                        function () { console.log("Couldn't send wifi data"); }
                    );
                },
                function () {
                    alert("Not Connected to Bluetooth");
                });
        },
        check_wifi_connection: function () {
            ble.isConnected(bluetooth.connected_id,
                function () {
                    ble.read(bluetooth.connected_id,
                        SERVICE_UUID_WIFI,
                        CHARACTERISTIC_UUID_WIFI_ISCONNECTED,
                        function (data) {
                            let notification = Array.from(new Uint8Array(data), 
                                        function(item) { 
                                            hex_num = item.toString(16);
                                            return hex_num.length > 1 ? hex_num : hex_num + "0";
                                        }).join('');
                            if (notification === "disconnected") {
                                alert("disconnected");
                            }
                            else {
                                alert("Connected to network: " + notification);
                            }
                        },
                        function () {
                            console.log("couldn't read from device");
                        });
                },
                function () {
                    alert("Not Connected to Bluetooth");
                })
        }
    }




    // add new device
    
    // Step 1: connection
    //bluetooth
    $("#button-start-stop-scan").on('click', bluetooth.scan_and_add);
    $('#button-connect-to-device').on('click', function(){return bluetooth.connect_to_device(bluetooth.get_id(bluetooth.device_to_connect))} ); 
    $("#disconnect-from-device").on('click', bluetooth.disconnect_from_device);
    $("#scan-result-list").on('click', 'li', bluetooth.select_scanned_device);

    // $("#start-refresh").on("click", window.panel.start_refresh);
    // $("#stop-refresh").on("click", window.panel.stop_refresh);

    //Step 2: Wi-Fi
    //wifi
    $("#scan-wifi-networks-in-device").on('click', wifi.scan_networks_on_device);
    $("#wifi-scan-result-list").on('click', 'li', wifi.select_scanned_network);
    $("#button-connect-device-to-wifi").on('click', wifi.connect_device_to_wifi);
    $("#button-check-wifi-connection").on('click', wifi.check_wifi_connection);


    $("#submit-register-data").on('click', registration.submit_registration_info);
    $("#submit-20-digit-code").on('click', registration.submit_20_digit_code);

    //configuration
    // registered_devices.forEach( (dev) => {
    //     opt = document.createElement("option");
    //     opt.text = dev.name;
    //     $("#device-list").append(opt);
    // });

    // window.configuration = {
    //     use_local_mode: function() {
    //         bluetooth.connect_to_device();
    //         ble.isConnected(bluetooth.connected_id, 
    //         function() {
    //             window.panel.mode = MODES.LOCAL;
    //             $("#enable-local-mode").button('disable');
    //             $("#enable-remote-mode").button('enable');
    //         },
    //         function(){});
    //     },
    //     use_remote_mode: function() {
    //         if (!window.navigator.onLine) { // checks internet connection on smartphone
    //             alert("No internet connection");
    //         }
    //         else{
    //             window.panel.mode = MODES.REMOTE;
    //             $("#enable-local-mode").button('enable');
    //             $("#enable-remote-mode").button('disable');
    //         }
             
    //     }
    // }




    window.devices = {
        dev_unit: [],
        selected: "",
        add_device: function(name, ble_id){
            devices.dev_unit.push({ 
                name: name,
                ble_id: ble_id,

            });
            item = '<li><a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + name + '</a></li>'
            $("#device-list").append(item);
            let user = window.session.getInstance().get();
            user.devices = devices.dev_unit;
            window.session.getInstance().set(user);
        },
        remove_device_from_list: function(){
            for(var i = 0; i < devices.dev_unit.length; i++){
                if (devices.dev_unit[i].name === devices.selected){
                    devices.dev_unit.splice(i,1);
                }
            }
            let user = window.session.getInstance().get();
            user.devices = devices.dev_unit;
            window.session.getInstance().set(user);
            devices.refresh_device_list();
        },
        refresh_device_list: function(){
            $("#device-list").empty();
            devices.dev_unit.forEach(element => { 
                item = '<li><a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + element.name + '</a></li>'
                $("#device-list").append(item);
            });
        },
        connect_to_selected_device: function(){
            devices.dev_unit.forEach(element => {
            if(element.name === devices.selected)
                bluetooth.connect_to_device(element.ble_id);
                return;
            });
        },
        hasDevice: function(ble_id){
            for(var i = 0; i < devices.dev_unit.length; i++)
                if(devices.dev_unit[i].ble_id === ble_id)
                    return true;
            return false;
        },
        select_known_device: function() {
            devices.selected = $(this).find("a").text();
        },
        register_device: function(){
            if(devices.selected == "")
                alert("Tap a device first");
            else
                devices.dev_unit.forEach(element => {
                    if (element.name === devices.selected)
                        if(reg = registration.registration_info())
                            bluetooth.send_wificreds(reg.ssid + "," + reg.ssid_pw)
                });
        }
    }
    // $("#enable-remote-mode").button('disable');
    // $("#enable-remote-mode").on('click', configuration.use_remote_mode);
    // $("#enable-local-mode").on('click', configuration.use_local_mode);
    // $("#device-list").on('change', configuration.choose_device_list)
    $("#button-connect-to-known-device").on('click', devices.connect_to_selected_device);
    $("#device-list").on('click', 'li', devices.select_known_device);
    $("#delete-device-button").on('click', devices.remove_device_from_list);
    $("#button-register-device").on('click', devices.register_device);




    var bt_callbacks = {
        success: function () {
            console.log("sent message");
        },
        failure: function () {
            console.log("failed to send message");
        }
    };

    // document.getElementById('canvas-bt').innerHTML = window.frames["spa_bluetooth"];
    // $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
    
}



stringToBytes = function (string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}