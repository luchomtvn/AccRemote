document.addEventListener('deviceready', function () {
    // window.onload = function () {

    window.handleOpenURL = function (url) {
        $.mobile.changePage("#register-new-device", { transition: "slidedown", changeHash: false });
        autofill_registered(url);
    }

    window.autofill_registered = function (url) {
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


    // $("#time-zone-selector").timezones();

    window.websocket = {
        ws: null,
        url: "ws://localhost:3001/spa/HrU6CUAaSlsB9r0jxJTWr1Bzt7f032_0KVKfHy5IT9jGrtbs/wsa",
        onMessageCallback: function (msg) {
            console.log(msg);
            let screen = JSON.parse(msg.data).dsp;
            window.panel.display(screen);
        },
        openCallback: function () {
            console.log("WebSocket open on server");
        }
    }

    window.bluetooth = {
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
                    $("#devs-list li:not(:first-child)").remove();
                    $("#devs-list").append('<li data-sort-text="WAcc-4321"><a class="found-devices ui-btn ui-btn-icon-left ui-icon-cloud">Acc-4321</a></li>');
                    $("#devs-list").append('<li data-sort-text="WAcc-1111"><a class="found-devices ui-btn ui-btn-icon-left ui-icon-cloud">Acc-1111</a></li>');
                    $("#devs-list").append('<li data-sort-text="WAcc-1234"><a class="found-devices ui-btn ui-btn-icon-left ui-icon-cloud">Acc-1234</a></li>');
                    $("#devs-list").append('<li data-sort-text="ZAcc-5678"><a class="found-devices ui-btn ui-btn-icon-left ui-icon-gear" href="#device-list-page" data-transition="slide">Manage Devices</a></li>');
                    bluetooth.scanned_devices = [];
                    ble.startScan([SERVICE_UUID_OPERATION], function (device) {
                        // if (/Acc/.exec(device.name) !== null) {
                        if (device.name) {
                            console.log("Device found: ", device.name);
                            bluetooth.scanned_devices.push(device);
                            var item = '<li data-sort-text="B' + device.name + '"><a class="found-devices ui-btn ui-btn-icon-right ui-icon-home">' + device.name + '</a></li>'
                            $("#devs-list").append(item);
                            sortDeviceList();
                        }
                    }, function () {
                        navigator.notification.alert("Could not scan");
                        console.log("Could not scan");
                    });
                    setTimeout(() => {
                        ble.stopScan(function () { console.log("stopped scanning") }, function () { console.log("couldn't stop scanning") });
                    }, 10000);
                },
                function () {
                    navigator.notification.alert("Bluetooth is disabled");
                }
            )
        },
        connect_to_device: function (device_id) {
            ble.isEnabled(
                function () {
                    ble.isConnected(bluetooth.connected_id,
                        function () {
                            navigator.notification.alert("BT Already Connected");
                        },
                        function () {
                            console.log("Connecting...");
                            ble.connect(device_id,
                                function () {
                                    bluetooth.connected_id = device_id;
                                    console.log("Connected to device id " + bluetooth.connected_id);
                                    let session = window.session.getInstance().get();
                                    // bluetooth.send_usertoken(session.final_token);
                                    if (!window.devices.hasDevice(device_id))
                                        window.devices.add_device(bluetooth.device_to_connect, device_id);
                                    navigator.notification.alert("BT Connected!");
                                    window.panel.start_refresh();
                                },
                                function () {
                                    // disable local use
                                    console.log("Disconnected from " + bluetooth.connected_id);
                                    navigator.notification.alert("");
                                    // window.panel.stop_refresh();
                                });
                        }
                    );
                },
                function () {
                    navigator.notification.alert("Bluetooth Disabled!");
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
                    navigator.notification.alert("BT Disconnected!");
                    // window.panel.stop_refresh();
                },
                function () {
                    // disable local use
                    // window.panel.stop_refresh();
                    navigator.notification.alert("Error Disconnecting");
                    console.log("Error Disconnecting");
                });
        },
        writeFailure: function () {
            console.log("Couldn't write to module by bluetooth");
        },
        send_keyboard: function (keys_info) {

            ble.write(bluetooth.connected_id,
                SERVICE_UUID_OPERATION,
                CHARACTERISTIC_UUID_KEYBOARD,
                bluetooth.stringToBytes(keys_info),
                function () {
                    console.log("sent keyboard: " + keys_info)
                },
                bluetooth.writeFailure
            );
        },
        send_temperature: function (keys_info) {

            ble.write(bluetooth.connected_id,
                SERVICE_UUID_OPERATION,
                CHARACTERISTIC_UUID_TEMPERATURE,
                bluetooth.stringToBytes(keys_info),
                function () {
                    console.log("sent temperature: " + keys_info)
                },
                bluetooth.writeFailure
            );
        },
        send_time: function (keys_info) {

            ble.write(bluetooth.connected_id,
                SERVICE_UUID_OPERATION,
                CHARACTERISTIC_UUID_TIME,
                bluetooth.stringToBytes(keys_info),
                function () {
                    console.log("sent keyboard: " + keys_info)
                },
                bluetooth.writeFailure
            );
        },
        send_session: function (keys_info) {

            ble.write(bluetooth.connected_id,
                SERVICE_UUID_OPERATION,
                CHARACTERISTIC_UUID_SESSION,
                bluetooth.stringToBytes(keys_info),
                function () {
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
                    console.log("sent wificreds: " + wificreds);
                },
                bluetooth.writeFailure
            );
        },
        send: function (characteristic, message) {
            ble.isConnected(bluetooth.connected_id,
                function () {
                    window["bluetooth"]["send_" + characteristic](message);
                },
                function () {
                    console.log("Bluetooth disconnected");
                })
        },
        read_characteristic: function (characteristic) {
            ble.isConnected(bluetooth.connected_id,
                function () {
                    ble.read(bluetooth.connected_id, SERVICE_UUID_OPERATION, characteristic,
                        function (data) {
                            let data_read = Array.from(new Uint8Array(data),
                                function (item) {
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
        },
        subscribe_to_characteristic: function (characteristic) {
            ble.isConnected(bluetooth.connected_id,
                function () {
                    ble.startNotification(bluetooth.connected_id, SERVICE_UUID_OPERATION, characteristic,
                        function (data) {
                            let data_read = Array.from(new Uint8Array(data),
                                function (item) {
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


    // // add new device

    // // Step 1: connection
    // //bluetooth
    // $("#button-start-stop-scan").on('click', bluetooth.scan_and_add);
    // $('#button-connect-to-device').on('click', function () { return bluetooth.connect_to_device(bluetooth.get_id(bluetooth.device_to_connect)) });
    // $("#disconnect-from-device").on('click', bluetooth.disconnect_from_device);
    // $("#scan-result-list").on('click', 'li', bluetooth.select_scanned_device);
    // $("#submit-register-data").on('click', registration.submit_registration_info);
    // $("#submit-20-digit-code").on('click', registration.submit_20_digit_code);

    // window.devices = {
    //     dev_unit: [],
    //     selected: "",
    //     add_device: function (name, ble_id) {
    //         devices.dev_unit.push({
    //             name: name,
    //             ble_id: ble_id,

    //         });
    //         item = '<li><a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + name + '</a></li>'
    //         $("#device-list").append(item);
    //         let user = window.session.getInstance().get();
    //         user.devices = devices.dev_unit;
    //         window.session.getInstance().set(user);
    //     },
    //     remove_device_from_list: function () {
    //         for (var i = 0; i < devices.dev_unit.length; i++) {
    //             if (devices.dev_unit[i].name === devices.selected) {
    //                 devices.dev_unit.splice(i, 1);
    //             }
    //         }
    //         let user = window.session.getInstance().get();
    //         user.devices = devices.dev_unit;
    //         window.session.getInstance().set(user);
    //         devices.refresh_device_list();
    //     },
    //     refresh_device_list: function () {
    //         $("#device-list").empty();
    //         devices.dev_unit.forEach(element => {
    //             item = '<li data-sort-text="B' + element.name + '"><a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + element.name + '</a></li>'
    //             $("#device-list").append(item);
    //             sortDeviceList();
    //         });
    //     },
    //     connect_to_selected_device: function () {
    //         devices.dev_unit.forEach(element => {
    //             if (element.name === devices.selected)
    //                 bluetooth.connect_to_device(element.ble_id);
    //             return;
    //         });
    //     },
    //     hasDevice: function (ble_id) {
    //         for (var i = 0; i < devices.dev_unit.length; i++)
    //             if (devices.dev_unit[i].ble_id === ble_id)
    //                 return true;
    //         return false;
    //     },
    //     select_known_device: function () {
    //         devices.selected = $(this).find("a").text();
    //     },
    //     register_device: function () {
    //         if (devices.selected == "")
    //             navigator.notification.alert("Tap a device first");
    //         else
    //             devices.dev_unit.forEach(element => {
    //                 if (element.name === devices.selected)
    //                     if (reg = registration.registration_info())
    //                         transmitter.send_by_bt("email", $("#e-mail-address").val());
    //                 // bluetooth.send_wificreds(reg.ssid + "," + reg.ssid_pw)
    //             });
    //     },
    //     set_time_on_device: function () {
    //         now = new Date();
    //         var hours, ampm;
    //         hours = now.getHours();
    //         if (now.getHours() > 12) {
    //             hours = now.getHours() - 12;
    //             ampm = "P";
    //         }
    //         else {
    //             ampm = "A";
    //         }
    //         hours = hours.toString();
    //         minutes = now.getMinutes().toString();
    //         hours = hours == "00" ? "12" : hours;
    //         if (String(hours).length < 2) hours = "0" + hours;
    //         if (String(minutes).length < 2) minutes = "0" + minutes;

    //         window.transmitter.send_to_module("time", hours + now.getMinutes() + ampm);
    //     }
    // }
    // $("#button-connect-to-known-device").on('click', devices.connect_to_selected_device);
    // $("#device-list").on('click', 'li', devices.select_known_device);
    // $("#delete-device-button").on('click', devices.remove_device_from_list);
    // // $("#button-register-device").on('click', devices.register_device);
    // $("#submit-time-zone").on('click', devices.set_time_on_device)
    // $("#button-send-wificreds").on('click', function () {
    //     transmitter.send_to_module("wificreds", {
    //         ssid: $("#ssid").val(),
    //         passwd: $("#ssid-pw").val()
    //     });
    // });
    // $("#button-send-email").on('click', function () {
    //     transmitter.send_to_module("email", $("#e-mail-address").val());
    // });

    // document.getElementById('select-spas-button').addEventListener('click', function (e) {
    //     window.bluetooth.scan_and_add();
    // });


    // $('#home-page').live('pagebeforecreate', function (e) {
    //     console.log("home-page beforecreate fired: ", e);
    // });
    // $('#device-list-page').live('pagebeforecreate', function (e) {
    //     console.log("device-list-page beforecreate fired: ", e);
    // });
});

$(window).on('navigate', function (e) {
    console.log("navigate fired: ", e);
    // $.mobile.navigate('#device-list-page');
});
// $('#device-list-page').on('pagecontainerbeforetransition', function (e) {
//     console.log("device-list-page beforecreate fired: ", e);
// });
// });

function sortDeviceList() {
    var list, i, switching, b, shouldSwitch;
    list = document.getElementById("devs-list");
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        b = list.getElementsByTagName("LI");
        // Loop through all list items: (starts from 1 because of the list separator)
        for (i = 1; i < (b.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Check if the next item should
            switch place with the current item: */
            if (b[i].getAttribute('data-sort-text') > b[i + 1].getAttribute('data-sort-text')) {
                /* If next item is alphabetically lower than current item,
                mark as a switch and break the loop: */
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark the switch as done: */
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
        }
    }
}
// var aux_cnt = 0;

function isConnected_p() {
    return new Promise(function (resolve, reject) {
        ble.isConnected(window.selected_device.id, function () {
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

function disconnect_p() {
    return new Promise(function (resolve, reject) {
        ble.disconnect(window.selected_device.id, function () {
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

function subscribe_characteristic_display() {
    ble.startNotification(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_DISPLAY, function (data) {
        panel.display(arr2hex(new Uint8Array(data)));
        // console.log("Display notification nro ", ++aux_cnt);
    }, function (error) {
        console.log('Error writing (subscribing) characteristic descriptor for display: ', error);
    })
}


function subscribe_characteristic_mmode() {
    ble.startNotification(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, function (data) {
        var rec = arr2str(new Uint8Array(data));
        window.acc_mmode = rec;
        console.log("MMODE received: " + rec);
    }, function (error) {
        console.log('Error writing (subscribing) characteristic descriptor for mmode: ', error);
    })
}

function subscribe_characteristic_cras() {
    ble.startNotification(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_CRAS, function (data) {
        var rec = arr2str(new Uint8Array(data));
        window.acc_cras = rec;
        console.log("CRAS received: " + rec);
    }, function (error) {
        console.log('Error writing (subscribing) characteristic descriptor for cras: ', error);
    })
}

function unsubscribe_characteristic_display_p() {
    return new Promise(function (resolve, reject) {
        ble.stopNotification(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_DISPLAY, function () {
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}
function unsubscribe_characteristic_mmode_p() {
    return new Promise(function (resolve, reject) {
        ble.stopNotification(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, function () {
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}
function unsubscribe_characteristic_cras_p() {
    return new Promise(function (resolve, reject) {
        ble.stopNotification(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_CRAS, function () {
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

function write_characteristic_mcode() {
    var password = ''; // default is no password
    if (window.known_local_devices && window.known_local_devices[window.selected_device.id])
        password = window.known_local_devices[window.selected_device.id].pass || '';
    var to_send = str2arr(window.acc_mcode + password).buffer;
    ble.write(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MCODE, to_send, function () {
        console.log("Envio con mcode: ", to_send);
    }, function (error) {
        console.log('Error writing characteristic mcode: ', error);
    })
}

function write_characteristic_btname(name) {
    if (!name) return "Error, name not set";
    var to_send = str2arr(name).buffer;
    ble.write(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_BTNAME, to_send, function () {
        console.log("Envio con btname: ", to_send);
    }, function (error) {
        console.log('Error writing characteristic btname: ', error);
    })
}

function write_characteristic_mmode(cmd) {
    if (!cmd) return "Error, cmd not set";
    var data = new Uint8Array(1);
    data[0] = cmd.charCodeAt(0);
    ble.write(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, data.buffer, function () {
        console.log("Envio con mmode: ", data[0]);
    }, function (error) {
        console.log('Error writing characteristic mmode: ', error);
    })
}

function read_characteristic_display() {
    ble.read(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_DISPLAY, function (data) {
        var rec = arr2hex(new Uint8Array(data));
        console.log("Recibio display: ", rec);
        panel.display(rec);
    }, function (error) {
        console.log('Error reading characteristic display: ', error);
    })
}

function read_characteristic_wifimac() {
    ble.read(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_WIFIMAC, function (data) {
        var rec = arr2str(new Uint8Array(data));
        console.log("Recibio wifimac: ", rec);
    }, function (error) {
        console.log('Error reading characteristic wifimac: ', error);
    })
}

function read_characteristic_version() {
    ble.read(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_VERSION, function (data) {
        var rec = arr2str(new Uint8Array(data));
        console.log("Recibio version: ", rec);
    }, function (error) {
        console.log('Error reading characteristic version: ', error);
    })
}

function read_characteristic_mmode() {
    ble.read(window.selected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, function (data) {
        var rec = arr2str(new Uint8Array(data));
        console.log("Recibio mmode: ", rec);
    }, function (error) {
        console.log('Error reading characteristic mmode: ', error);
    })
}

function bleconnected() {
    console.log("Connected...");
    subscribe_characteristic_mmode();
    subscribe_characteristic_display();
    subscribe_characteristic_cras();
    write_characteristic_mcode();
    read_characteristic_wifimac();
    read_characteristic_display();
}
function bledisconnected() {
    console.log("Disconnected...");
}

function conn() {
    ble.autoConnect(window.selected_device.id, bleconnected, bledisconnected);
}

function disconn() {
    isConnected_p()
        .then(unsubscribe_characteristic_cras_p)
        .then(unsubscribe_characteristic_display_p)
        .then(unsubscribe_characteristic_mmode_p)
        .then(disconnect_p)
        .then(console.log.bind(console, "Disconnected ok..."))
        .catch(console.log.bind(console, "Error on disconnect"))
}

function arr2str(arr) {
    return String.fromCharCode.apply(null, arr);
}
function arr2hex(arr) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(arr, x => ('0' + x.toString(16)).slice(-2)).join('');
}

function str2arr(str) {
    var strLen = str.length;
    var arr = new Uint8Array(strLen);
    for (var i = 0; i < strLen; i++) {
        arr[i] = str.charCodeAt(i);
    }
    return arr;
}

function pincheck() {
    var passw = /[0-9]{4}/;
    var pin = document.getElementById('device-pw').value;
    $("#pin-check-popup").popup();
    if (pin.match(passw)) {
        // Enviar password al device
        return true;
    }
    else {
        $("#pin-check-popup").popup("open");
        return false;
    }
}