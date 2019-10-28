

var refresh;
var pool_interval = 200; // ms for pool BT screen

window.onload = function () {
    // page events
    $(document).on('swipe', function () {
        panel.stop_refresh();
        $.mobile.changePage("#main-page", { transition: "slideleft", changeHash: false });
    });

    $.mobile.defaultPageTransition = 'none'
    $.mobile.defaultDialogTransition = 'none'
    $.mobile.buttonMarkup.hoverDelay = 0


    window.buttons = {
        connect_new_device: function () {
            $.mobile.changePage("#connect-new-device", { transition: "slidedown", changeHash: false });
        },
        set_device_wifi: function () {
            $.mobile.changePage("#set-device-wifi", { transition: "slidedown", changeHash: false });
        },
        local_access: function () {
            ble.isConnected(bluetooth.connected_id,
                function () {
                    let type = "spa";
                    document.getElementById('canvas-bt').innerHTML = window.frames[type + "_bluetooth"];
                    panel.link_buttons();
                    panel.init_leds();
                    panel.start_refresh();

                    $.mobile.changePage("#control-page-bt", { transition: "slidedown", changeHash: false });
                },
                function () {
                    alert("Must be connected to device via Bluetooth");
                });
        },
        remote_access: function () {
            let type = "spa";
            document.getElementById('canvas').innerHTML = window.frames[type];
            panel.link_buttons();
            panel.set_sliders(type);
            $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });

        },
        send_post: function () {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:3001/asettemp',
                data: {
                    'temp': 50,
                    'mac': '3C:71:BF:84:AB:64'
                },
                success: function () {
                    alert('POSTed value of 50 for temp.');
                },
                failure: function () {
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


    window.bluetooth = {
        scanned_devices: [],
        device_to_connect: {},
        select_scanned_device: function () {
            $("#button-connect-to-device").removeClass("ui-state-disabled");
            bluetooth.device_to_connect = $(this).find("a").text();
        },
        scan_and_add: function () {
            // $("#scan-result-list").empty();
            ble.isEnabled(
                function () {
                    $("#scan-result-list").empty();
                    ble.startScan([], function (device) {
                        if (/Acc/.exec(device.name) !== null) {
                            // bt_module.add_scanned_device(device.name, device.id);
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
        connect_to_device: function () {
            ble.isEnabled(
                function () {
                    ble.isConnected(bluetooth.connected_id,
                        function () {
                            alert("BT Already Connected");
                        },
                        function () {
                            console.log("Connecting...");
                            ble.connect(bluetooth.get_id(bluetooth.device_to_connect),
                                function () {
                                    bluetooth.connected_id = bluetooth.get_id(bluetooth.device_to_connect);
                                    console.log("Connected to device id " + bluetooth.connected_id);
                                    alert("BT Connected!");
                                },
                                function () {
                                    // disable local use
                                    console.log("Disconnected from " + bluetooth.connected_id);
                                    alert("BT Disconnected!");
                                    panel.stop_refresh();
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
        disconnect_from_device: function () {
            ble.disconnect(bluetooth.connected_id,
                function () {
                    console.log("BT Disconnected!");
                    alert("BT Disconnected!");
                    panel.stop_refresh();
                },
                function () {
                    // disable local use
                    console.log("Error Disconnecting");
                });
        }
    }



    stop_screen = function () {
        if (!window.refresh_screen_loop)
            clearInterval(window.refresh_screen_loop);
    }

    var wifi = {
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
                            let scan_list = String.fromCharCode.apply(null, new Uint8Array(data));
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
                            let notification = String.fromCharCode.apply(null, new Uint8Array(data));
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

    //bluetooth
    $("#button-start-stop-scan").on('click', bluetooth.scan_and_add);
    $('#button-connect-to-device').on('click', bluetooth.connect_to_device);
    $("#disconnect-from-device").on('click', bluetooth.disconnect_from_device);
    $("#scan-result-list").on('click', 'li', bluetooth.select_scanned_device);

    // $("#start-refresh").on("click", panel.start_refresh);
    // $("#stop-refresh").on("click", panel.stop_refresh);

    //set wifi buttons
    $("#wifi-scan-result-list").on('click', 'li', wifi.select_scanned_network);
    $("#scan-wifi-networks-in-device").on('click', wifi.scan_networks_on_device);
    $("#button-connect-device-to-wifi").on('click', wifi.connect_device_to_wifi);
    $("#button-check-wifi-connection").on('click', wifi.check_wifi_connection);

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
    window.panel = {
        buttons: { 2: 'aux', 3: 'jets', 4: 'system', 7: 'aux2', 6: 'light', 8: 'down', 9: 'up', 10: 'set-time', 11: 'set-temp' },
        buttons_codes: {
            'aux': 'x0', 'jets': 'j0', 'system': 's0', 'light': 'l0', 'aux2': 'a0',
            'down': 'd0', 'up': 'u0', 'set-time': 'd1', 'set-temp': 'u1'
        },
        reset_buttons: function () {
            for (var b in panel.buttons) {
                $("#button-" + buttons[b] + "-frame").attr("style", $("#button-" + buttons[b] + "-frame").data("off"));
                var mytimer = $("#button-" + buttons[b] + "-frame").data("timer");
                if (mytimer !== '') {
                    clearTimeout(mytimer);
                    $("#button-" + buttons[b] + "-frame").data("timer", '');
                }
            }
        },
        link_buttons: function () {

            for (var b in panel.buttons) {
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
                let message = panel.buttons_codes[panel.buttons[b]] + '\0';

                $("#button-" + panel.buttons[b] + "-frame").on("vclick", function () { // inside the function, 'this' is the html object that was clicked
                    // var bdata = $(this).data("b");
                    // var tout = bdata == 6 ? 1000 : 1000;
                    var tout = 1000;
                    $(this).attr("style", $(this).data("int"));
                    ble.write(bluetooth.connected_id, SERVICE_UUID_OPERATE, CHARACTERISTIC_UUID_OPERATE_BUTTON,
                        bluetooth.stringToBytes(message), bt_callbacks.success, bt_callbacks.failure);
                    let self = this;
                    var mytimer = setTimeout(function () {
                        $(self).attr("style", off_style);
                    }, tout);
                    $(this).data("timer", mytimer);
                });

            }

        },
        device_limits: {
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
        set_sliders: function (type) {
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

            $("#submit-temp").on('click', function () {
                alert("submitted temp " + $("#slider-temp").val());
            });

            // var slider_session = new Slider("session", 10, MAX_SESSION, MIN_SESSION, bt_module);

            $("#slider-session").attr("min", device_limits["session_min"]);
            $("#slider-session").attr("max", device_limits["session_max"]);
            $("#slider-session").change(function () {
                $("#slider-session").val(this.value);
            }).change();
            $("#submit-session").on('click', function () {
                alert("submitted session");
            });
        },
        f2c: function (far) {
            var stepval = far - 45;
            stepval = stepval.toFixed(0);
            var hstepval = Math.floor(stepval / 2);
            var cval = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
            return cval.toFixed(1);
        },

        digits: [0, 1, 2, 3],
        snames: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        segments: new Array(6),
        onstyles: new Array(6),
        offstyles: new Array(6),

        init_leds: function () {
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
        display: function (rx) {
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
        },
        start_refresh: function () {
            if (refresh !== undefined) return;
            var wait_refresh = 0;
            refresh = setInterval(() => {
                if (wait_refresh > 0) wait_refresh--;
                if (wait_refresh != 0) return;
                wait_refresh = 60000 / pool_interval;
                ble.read(bluetooth.connected_id, SERVICE_UUID_OPERATE, CHARACTERISTIC_UUID_OPERATE_SCREEN,
                    function (data) {
                        let screen = String.fromCharCode.apply(null, new Uint8Array(data));
                        // $("#json_recv").text(screen);
                        panel.display(screen);
                        wait_refresh = 0;
                    },
                    function () {
                        alert("Panel disconnected");
                        wait_refresh = 10000 / pool_interval;
                        // panel.stop_refresh();
                        // $("#json_recv").text("errores conectado: " + ++counter);
                    });
            }, pool_interval);
        },
        stop_refresh: function () {
            if (refresh !== undefined) {
                clearInterval(refresh);
                refresh = undefined;
            }
        }
    }
}






stringToBytes = function (string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}