// var MAX_TEMP_FAR_SAUNA = 160;
// var MIN_TEMP_FAR_SAUNA = 50;
// var MAX_TEMP_CEL_SAUNA = 70.8;
// var MIN_TEMP_CEL_SAUNA = 10.3;
// var MAX_TEMP_FAR_SPA = 104;
// var MIN_TEMP_FAR_SPA = 45;
// var MAX_TEMP_CEL_SPA = 40;
// var MIN_TEMP_CEL_SPA = 7.6;
// var MAX_SESSION = 60;
// var MIN_SESSION = 10;



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

    $.mobile.defaultPageTransition = 'none'
    $.mobile.defaultDialogTransition = 'none'
    $.mobile.buttonMarkup.hoverDelay = 0




    var buttons = {
        connect_new_device : function () {
            $.mobile.changePage("#connect-new-device", { transition: "slidedown", changeHash: false });
        },
        set_device_wifi: function () {
            $.mobile.changePage("#set-device-wifi", { transition: "slidedown", changeHash: false });
        },
        local_access: function () {
            refresh_screen();
            let type = "spa";
            document.getElementById('canvas-bt').innerHTML = window.frames[type + "_bluetooth"];
            panel.link_buttons();
            panel.init_leds();
            
            $.mobile.changePage("#control-page-bt", { transition: "slidedown", changeHash: false });
        },
        remote_access: function() {
            refresh_screen();
            let type = "spa";
            document.getElementById('canvas').innerHTML = window.frames[type];
            panel.link_buttons();
            panel.set_sliders(type);
            $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });

        },
        send_post: function () {
            $.ajax({
                type: 'POST',
                url:'http://localhost:3001/asettemp',
                data: {
                    'temp': 50,
                    'mac': '3C:71:BF:84:AB:64'
                },
                success: function() {
                    alert('POSTed value of 50 for temp.');
                },
                failure: function() {
                    alert('couldn\'t post');
                }
            })
        }
    }
    //main page buttons
    $("#connect-new-device").on('click', buttons.connect_new_device);
    $("#set-device-wifi").on('click', buttons.set_device_wifi);
    $("#local-use").on('click', buttons.local_access);
    $("#remote-use").on('click', buttons.remote_access);
    $("#test-btn").on('click', buttons.send_post);

    // page events
    $(document).on('swipe', function () {
        $.mobile.changePage("#main-page", { transition: "slide", changeHash: false });
    });



    window.bluetooth = {
        scanned_devices : [],
        device_to_connect,
        select_scanned_device : function() {
            $("#button-connect-to-device").removeClass("ui-state-disabled");
            bluetooth.device_to_connect = $(this).find("a").text();
        },
        scan_and_add : function() {
            // $("#scan-result-list").empty();
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

    var counter = 0;

    refresh_screen = function() {
        if(window.refresh_screen_loop) return;
        
        window.refresh_screen_loop = setInterval(() => {
        // $("#json_recv").text("antes de leer " + counter );
        ble.isConnected(bluetooth.connected_id, 
            function(){
                ble.read(bluetooth.connected_id, SERVICE_UUID_OPERATE, CHARACTERISTIC_UUID_OPERATE_SCREEN,
                        function(data){
                            let screen = String.fromCharCode.apply(null, new Uint8Array(data));
                            $("#json_recv").text(screen);
                            panel.display(screen);
                        },
                        function(){
                            $("#json_recv").text("errores conectado: " + counter);
                        });
            },
            function(){
                $("#json_recv").text("errores desconectado: " + counter);
            });
        counter++;
        }, 25);
    }

    stop_screen = function () {
        if (!window.refresh_screen_loop)
            clearInterval(window.refresh_screen_loop);
    }

    var wifi = {
        select_scanned_network : function () {
            $("#ssid").val($(this).find("a").text());
        },
        scan_networks_on_device : function () {
            ble.read(bluetooth.connected_id,
                SERVICE_UUID_CONFIG,
                CHARACTERISTIC_UUID_CONFIG_SCANWIFI,
                function(data){
                    $("#wifi-scan-result-list").empty();
                    let scan_list = String.fromCharCode.apply(null, new Uint8Array(data));
                    scan_list.split(",").forEach(function(item){
                        $("#wifi-scan-result-list").append(`<li> <a class="found-network ui-btn ui-btn-icon-right ui-icon-carat-r">${item}</a> </li>`);
                    });
                },
                function(){
                    console.log("couldn't read value");
                });
        },
        connect_device_to_wifi: function() {
            wifi_data = {
                "wifi_ssid": $("#ssid").val(),
                "wifi_passwd": $("#ssid-pw").val()
            }
            ble.write(bluetooth.connected_id,
                SERVICE_UUID_CONFIG,
                CHARACTERISTIC_UUID_CONFIG_SETWIFI,
                stringToBytes(JSON.stringify(wifi_data)),
                function () { console.log("Sent wifi data"); },
                function () { console.log("Couldn't send wifi data"); }
            );
        }
    }


    //bluetooth
    $("#button-start-stop-scan").on('click', bluetooth.scan_and_add);
    $('#button-connect-to-device').on('click', bluetooth.connect_to_device);
    $("#scan-result-list").on('click', 'li', bluetooth.select_scanned_device);

    //set wifi buttons
    $("#wifi-scan-result-list").on('click', 'li', wifi.select_scanned_network);
    $("#scan-wifi-networks-in-device").on('click', wifi.scan_networks_on_device);
    $("#button-connect-device-to-wifi").on('click', wifi.connect_device_to_wifi);
    // $("#found-network").on('click', 'li', wifi.write_ssid_as_found_network);
    // globals.dry_run = false;
    // all the "frontend" processes driven by events such as clicks and callbacks

    
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
window.panel = {
    buttons : { 2: 'aux', 3: 'jets', 4: 'system', 7: 'aux2', 6: 'light', 8: 'time-down', 9: 'temp-up'},
    buttons_codes: {'aux': 'x', 'jets': 'j', 'system': 's', 'light': 'l', 'aux2': 'a', 'time-down': 'd', 'temp-up': 'u'},
    reset_buttons : function() {
        for (var b in panel.buttons) {        
            $("#button-" + buttons[b] + "-frame").attr("style", $("#button-" + buttons[b] + "-frame").data("off"));
            var mytimer = $("#button-" + buttons[b] + "-frame").data("timer");
            if (mytimer !== '') {
                clearTimeout(mytimer);
                $("#button-" + buttons[b] + "-frame").data("timer", '');
            }
        }
    },
    link_buttons : function() {

        for (var b in panel.buttons){
            let on_style = $("#button-" + panel.buttons[b] + "-frame").attr("style");
            if (on_style == undefined) continue; // unused button
            let off_style = on_style.replace(/stroke-opacity[^;]*;?/, "");
            if (off_style.length > 0) { off_style += ';' };
            off_style += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
            $("#button-" + panel.buttons[b] + "-frame").attr("style", off_style);
            // $("#button-" + panel.buttons[b] + "-frame").data("b", 0);
            $("#button-" + panel.buttons[b] + "-frame").data("off", off_style);
            $("#button-" + panel.buttons[b] + "-frame").data("int", off_style + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff');
            $("#button-" + panel.buttons[b] + "-frame").data("timer", '');
            let message = panel.buttons_codes[panel.buttons[b]] + '0' + '\0';

            $("#button-" + panel.buttons[b] + "-frame").on("vclick", function () { // inside the function, 'this' is the html object that was clicked
                // var bdata = $(this).data("b");
                // var tout = bdata == 6 ? 1000 : 1000;
                var tout = 1000;
                $(this).attr("style", $(this).data("int"));
                ble.write(bluetooth.connected_id, SERVICE_UUID_OPERATE, CHARACTERISTIC_UUID_OPERATE_BUTTON,
                        bluetooth.stringToBytes(message), bt_callbacks.success, bt_callbacks.failure);
                let self = this;
                var mytimer = setTimeout( function () {
                    $(self).attr("style", off_style);
                }, tout);
                $(this).data("timer", mytimer);
            });

        }

    },
    device_limits : {
        "spa": {
            "temp_max_f": 104,
            "temp_min_f": 45,
            "temp_max_c": 40,
            "temp_min_c": 7.6,
        },
        "sauna": {
            "temp_max_f": 160,
            "temp_min_f": 50,
            "temp_max_c": 70.8,
            "temp_min_c": 10.3,
            "session_max": 60,
            "session_min": 10
        }
    },
    set_sliders : function (type) {
        let device_limits = this.device_limits;
        let f2c = this.f2c;
        $("#flip-scale").on("change", function () {
            var scale = this.value;
            var textslider = '';
            if (scale == 0) {
                // textslider = 'Slider (°F):';
                $("#slider-temp").attr("min", device_limits["temp_min_f"])
                                 .attr("max", device_limits["temp_max_f"])
                                 .attr("step", 1).val($("#slider-2-temp").val());
            }
            else {
                // textslider = 'Slider (°C):';
                var cval = f2c($("#slider-2-temp").val());
                $("#slider-temp").attr("min", device_limits["temp_min_c"])
                                 .attr("max", device_limits["temp_max_c"])
                                 .attr("step", .1).val(cval);
            }
            $("#slider-label").text(textslider);
        });
        $("#flip-scale").change();

        let oldvalue = $("#slider-temp").attr("value");
        $("#slider-temp").change(function () {
            if ($("#flip-scale").val() == 1) {
                var number = parseFloat(this.value);
                if (!(number <= device_limits["temp_max_c"] && number >= device_limits["temp_min_c"])) number = f2c(parseFloat(oldvalue));
                var n10 = ((number - 7.6) * 10).toFixed(0);
                var delta = n10 % 11;
                var base = Math.floor(n10 / 11);
                if (delta > 7) { base++; delta = 0 }
                else if (delta > 3) { delta = 5 }
                else { delta = 0 };
                var sal = base * 11 + delta;
                sal /= 10;
                sal += 7.6;
                $(this).val(sal.toFixed(1));
                var far = 45 + base * 2;
                if (delta) far++;
                $("#slider-2-temp").val(far.toFixed(0));
            }
            else {
                if (!(this.value <= device_limits["temp_max_f"] && this.value >= device_limits["temp_min_f"])) this.value = oldvalue;
                $("#slider-2-temp").val(this.value);
            }
        }).change();

        $("#submit-temp").on('click', function(){
            alert("submitted temp " + $("#slider-temp").val());
        });

        // var slider_session = new Slider("session", 10, MAX_SESSION, MIN_SESSION, bt_module);

        if(type == "sauna"){
            $("#slider-session").attr("min", device_limits["session_min"]); 
            $("#slider-session").attr("max", device_limits["session_max"]);
            $("#slider-session").change(function () {
                $("#slider-session").val(this.value);
            }).change();
            $("#submit-session").on('click', function () {
                alert("submitted session");
            });
        }
    },
    f2c : function (far)  {
            var stepval = far - 45;
            stepval = stepval.toFixed(0);
            var hstepval = Math.floor(stepval / 2);
            var cval = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
            return cval.toFixed(1);
    },

    digits : [0,1,2,3],
    snames: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    segments : new Array(6),
    onstyles : new Array(6),
    offstyles : new Array(6),

    init_leds : function () {
        for (var d in this.digits) {
            this.segments[d] = new Array(8);
            for (var s in this.snames) {
                this.segments[d][s] = $("#digit-d" + d + "-s" + this.snames[s]);
            }
        }

        // Then initializes rest of array with notification leds
        this.segments[4] = new Array(8);
        this.segments[4][0] = $("#led-heating"); // led 'system' en sauna
        this.segments[4][1] = $("#led-airhi");
        this.segments[4][2] = $("#led-jetslo");
        this.segments[4][3] = $("#led-jetshi"); // led 'heating' en sauna
        this.segments[4][4] = $("#led-filtering");
        this.segments[4][5] = $("#led-edit");
        this.segments[4][6] = $("#led-overheat");
        this.segments[4][7] = $("#led-am");

        this.segments[5] = new Array(8);
        this.segments[5][4] = $("#led-light");
        this.segments[5][5] = $("#led-jets2hi");
        this.segments[5][6] = $("#led-jets2lo");
        this.segments[5][7] = $("#led-airlo");

        for (var d = 0; d < 6; d++) {
            this.onstyles[d] = new Array(8);
            this.offstyles[d] = new Array(8);
            for (var s = 0; s < 8; s++) {
                if (d == 5 && s < 4) continue;
                var auxonstyle = this.segments[d][s].attr("style");
                if (auxonstyle == undefined) continue; // unused led
                this.onstyles[d][s] = auxonstyle;
                var auxoffstyle = auxonstyle.replace(/fill-opacity[^;]*;?/, "");
                //            if (auxoffstyle.match(/^\s*$/)) {auxoffstyle+= ';'};
                if (auxoffstyle.length > 0) { auxoffstyle += ';' };
                auxoffstyle += 'fill-opacity:0.1';
                this.offstyles[d][s] = auxoffstyle;
            }
        }

    },
    display : function (rx) {
        $("#spascreen").text(rx);
        if (typeof (rx) == 'string' && rx.length == 12) {
            for (var ii = 0; ii < 6; ii++) {
                var dd = parseInt(rx.substring(ii * 2, ii * 2 + 2), 16);
                if (dd == 'NaN') dd = 0;
                for (var jj = 0, mm = 1; jj < 8; jj++ , mm <<= 1) {
                    if (ii == 5 && jj < 4) continue;
                    if (this.segments[ii][jj].attr("style") == undefined) continue; // unused led
                    this.segments[ii][jj].attr("style", (mm & dd) ? this.onstyles[ii][jj] : this.offstyles[ii][jj])
                }
            }
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