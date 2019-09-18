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


bt_module = new BluetoothModule(SERVICE_UUID, CHARACTERISTIC_UUID_READ);
ws_module = new WebSocketModule(SERVER_URL, true);

window.onload = function () {
    
    // globals.dry_run = false;
    // all the "frontend" processes driven by events such as clicks and callbacks

    //Click Events
    
    //Add new device
    $('#button-add-new-device').on('click', function () {
    $.mobile.changePage("#connection-page", { transition: "slidedown", changeHash: false });
    $("#scan-loader-animation").hide();

    });

    $('#button-start-stop-scan').on('click', function() {
        if (bt_module.scanner.status) { // scanning
            bt_module.stopScan();
            $("#scan-loader-animation").hide();
        }
        else{ // not scanning
            if (bt_module.connection.status){ //connected
                if(confirm('Bluetooth is already connected, press OK to disconnect')){
                    bt_module.disconnect();
                }
            }
            else{ // bt not connected  // TODO: SHOULD CHECK IF BLUETOOTH IS ON
                // if (!bt_module.readyToScan())
                // alert("Please turn on Bluetooth on mobile device");
                // else { // bluetooth ON
                bt_module.startScan(function (device) {
                    if (/Acc/.exec(device.name) !== null) {
                        bt_module.add_scanned_device(device.name, device.id);
                        $("#scan-result-list").append(
                            `<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">${device.name}</a> </li>`);
                    }
                });
                $("#scan-loader-animation").show();
                // }
            }
        }
    });
    var device_to_connect;

    $("#scan-result-list").on('click', 'li', function () {
        $("#button-connect-to-device").removeClass("ui-state-disabled");
        registration_data.device_name = $(this).find("a").text();
    });

    $('#button-connect-to-device').on('click', function() {
        device_id = bt_module.get_id(registration_data.device_name);
        console.log("Connecting...");
        bt_module.connect(registration_data.device_name, 
        function () {
            bt_module.connection.status = true;
            bt_module.connection.id = device_id;
            console.log("Connected to device id " + device_id);
            alert("Connected!");
            $.mobile.changePage("#registration-page", {transition: "slidedown",changeHash: false});
        }, 
        function () {
            console.log("Disconnected from " + device_id);
            alert("bluetooth disconnected");
            $.mobile.changePage("#connection-page", { transition: "slidedown", changeHash: false });
        });
    });


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
                    ble.read(bt_module.connection.id, SERVICE_UUID, CHARACTERISTIC_UUID_ERROR, read_value, read_value_error);
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


    document.getElementById('canvas').innerHTML = window.frames["spa"];
    // $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });


    var button_system  = new Button("system", "s0", bt_module);
    var button_light   = new Button("light", "l0", bt_module);
    var slider_session = new Slider("session", 10, MAX_SESSION, MIN_SESSION, bt_module);
    var slider_temp    = new SliderTemp("temp",
                                        50,
                                        MAX_TEMP_FAR_SPA,
                                        MIN_TEMP_FAR_SPA,
                                        MAX_TEMP_CEL_SPA,
                                        MIN_TEMP_CEL_SPA,
                                        bt_module,
                                        $("#flip-scale"));
    slider_session.set_change_function();
    slider_temp.set_change_function();

    new TimeZoneSelector("time-zone-selector", "form-timezones", "submit-time-zone", bt_module);

    // $(document).on('click', ".device", function () {
    //     $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
    //     setScreen("spa");
    // });


}