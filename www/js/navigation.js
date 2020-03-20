document.addEventListener('deviceready', function () {
    // window.onload = function () {

    // window.handleOpenURL = function (url) {
    //     $.mobile.changePage("#register-new-device", { transition: "slidedown", changeHash: false });
    //     autofill_registered(url);
    // }

    // window.autofill_registered = function (url) {
    //     params = new URLSearchParams(url.split("?", 2)[1]);
    //     code = params.get("code");
    //     $("#code-20-digits").val(code);
    //     $([document.documentElement, document.body]).animate({
    //         scrollTop: $("#submit-20-digit-code").offset().top
    //     }, 700);
    // }

    // let type = "spa";

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

    window.acc_on = true;
    window.acc_wsbase = 'wss://accsmartlink.com/wsa/';
    document.addEventListener('pause', function () {
        window.acc_on = false;
        if (window.connected_device && window.connected_device.id) write_characteristic_mmode_p('D');
        console.log('event pause fired');
    });

    document.addEventListener('resume', function () {
        console.log('event resume fired');
        window.acc_on = true;
        base_navigation();
    });

    document.getElementById('devs-list').addEventListener('click', function (event) {
        window.known_local_devices = window.known_local_devices || {};
        if (event.target && event.target.nodeName == 'A') {
            const li_element = event.target.parentNode;
            const btname = li_element.getAttribute('data-btname');
            const btid = li_element.getAttribute('data-btid');
            const wifimac = li_element.getAttribute('data-wifimac');
            let pass = '';
            let ws = '';
            if (btid) {
                pass = btid in window.known_local_devices ? window.known_local_devices[btid].pass : '';
                console.log("selected local device: " + btname + ' (btid: ' + btid + ')');
            } else if (wifimac) {
                pass = window.known_remote_devices && wifimac in window.known_remote_devices ? window.known_remote_devices[wifimac].pass : '';
                ws = window.known_remote_devices && wifimac in window.known_remote_devices ? window.known_remote_devices[wifimac].ws : '';
                console.log("selected remote device: " + btname + ' (wifimac: ' + wifimac + ')');
            } else { console.log('Error: clicked on element without btid or wifimac'); return }
            var href = event.target.getAttribute('href') || '#';
            if (wifimac && href.match(/delete/)) { // delete route
                document.getElementById('delete-device-name').innerHTML = btname + ' (mac\u00A0' + wifimac + ')';
                window.wifimac_to_delete = wifimac;
                $('#delete-device-dialog').popup('open');
            } else {
                window.selected_device = {
                    id: btid,
                    name: btname,
                    pass: pass,
                    wifimac: wifimac,
                    ws: ws
                };
                base_navigation();
            }
        }
    });
    document.getElementById('delete-device-button').addEventListener('click', function () {
        delete window.known_remote_devices[window.wifimac_to_delete];
        window.wifimac_to_delete = null;
        save_known_remote_devices();
        base_navigation();
    });
});
document.getElementById('select-devices-button').addEventListener('click', function (e) {
    e.preventDefault();
    console.log('select-devices-button clicked with selected device: ', selected_device);
    selected_device = null;
    base_navigation();
    return false;
});

document.addEventListener("all_files_read", function () {
    console.log('all_files_read event received');
    window.known_remote_devices = window.known_remote_devices || {}; // avoid null case
    console.log('existing remotes: ', window.known_remote_devices);
    let remotes_to_add = {
        112233444321: { name: "Acc-4321", ws: "wss://accsmartlink.com/wsa/112233444321/ea4e8a29edd1dd1a7eac8fdaaf5316be19ca5522f285558f9a1d1fc863a19f35" },
        112233441111: { name: "Acc-1111", ws: "wss://accsmartlink.com/wsa/112233441111/ea4e8a29edd1dd1a7eac8fdaaf5316be19ca5522f285558f9a1d1fc863a19f35" },
        112233441234: { name: "Acc-1234", ws: "wss://accsmartlink.com/wsa/112233441234/ea4e8a29edd1dd1a7eac8fdaaf5316be19ca5522f285558f9a1d1fc863a19f35" }
    };
    Object.assign(window.known_remote_devices, remotes_to_add);
    console.log('new remotes: ', window.known_remote_devices);
    save_known_remote_devices();
    console.log('after save: ', window.known_remote_devices);
    base_navigation();
});

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
        // Loop through all list items: (start from 1 if you add a list separator)
        for (i = 0; i < (b.length - 1); i++) {
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
        ble.isConnected(window.connected_device.id, function () {
            console.log('BT is connected');
            resolve();
        }, function (error) {
            console.log('BT is disconnected');
            reject(error);
        })
    });
}

function disconnect_p() {
    return new Promise(function (resolve, reject) {
        if (!window.connected_device || ! 'id' in window.connected_device || !window.connected_device.id)
            reject("Error: trying to disconnect but connected_device not set");
        ble.disconnect(window.connected_device.id, function () {
            resolve('Disconnect from ' + window.connected_device.id + ' Ok');
        }, function (error) {
            reject('Error disconnecting from ' + window.connected_device.id, error);
        })
    });
}

function subscribe_characteristic_display() {
    ble.startNotification(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_DISPLAY, function (data) {
        const val = arr2hex(new Uint8Array(data));
        panel.display(val);
        console.log('display received ', val);
        if (window.connected_device_logo_status !== 3 && val !== '000000000000') {
            let icon = document.getElementById('connected-device-icon');
            const bluetooth_color = 'color:rgb(49,131,244';
            icon.setAttribute('style', bluetooth_color);
            icon.className = 'fab fa-bluetooth';
            window.connected_device_logo_status = 3;
        }
        // console.log("Display notification nro ", ++aux_cnt);
    }, function (error) {
        console.log('Error writing (subscribing) characteristic descriptor for display: ', error);
    })
}


function subscribe_characteristic_mmode() {
    ble.startNotification(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, function (data) {
        var rec = arr2str(new Uint8Array(data));
        window.acc_mmode = rec;
        if (rec.match(/M|N|B|F/)) {
            window.connected_device.mmode = rec;
            window.known_local_devices = window.known_local_devices || {};
            window.known_local_devices[window.connected_device.id] = Object.assign({}, window.connected_device);
            delete window.known_local_devices[window.connected_device.id].id;
            save_known_local_devices();
        }
        if (window.connected_device_logo_status <= 1) {
            let icon = document.getElementById('connected-device-icon');
            const white_color = 'color:rgb(255,255,255);';
            icon.setAttribute('style', white_color);
            icon.className = 'fab fa-bluetooth';
            window.connected_device_logo_status = 2;
        }

        console.log("MMODE received: " + rec);
    }, function (error) {
        console.log('Error writing (subscribing) characteristic descriptor for mmode: ', error);
    })
}

function subscribe_characteristic_cras() {
    ble.startNotification(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_CRAS, function (data) {
        var rec = arr2str(new Uint8Array(data));
        window.acc_cras = rec;
        console.log("CRAS received: " + rec);
    }, function (error) {
        console.log('Error writing (subscribing) characteristic descriptor for cras: ', error);
    })
}

function unsubscribe_characteristic_display_p() {
    return new Promise(function (resolve, reject) {
        ble.stopNotification(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_DISPLAY, function () {
            console.log('unsuscribe display Ok');
            resolve();
        }, function (error) {
            console.log('unsuscribe display error: ', error);
            reject(error);
        })
    });
}
function unsubscribe_characteristic_mmode_p() {
    return new Promise(function (resolve, reject) {
        ble.stopNotification(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, function () {
            console.log('unsuscribe mmode Ok');
            resolve();
        }, function (error) {
            console.log('unsuscribe mmode error: ', error);
            reject(error);
        })
    });
}
function unsubscribe_characteristic_cras_p() {
    return new Promise(function (resolve, reject) {
        ble.stopNotification(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_CRAS, function () {
            console.log('unsuscribe cras Ok');
            resolve();
        }, function (error) {
            console.log('unsuscribe cras error: ', error);
            reject(error);
        })
    });
}

function write_characteristic_mcode_p() {
    var password = window.connected_device.pass;
    var to_send = str2arr(window.acc_mcode + password).buffer;
    return new Promise(function (resolve, reject) {
        ble.write(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MCODE, to_send, function () {
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

function write_characteristic_btname_p(name) {
    return new Promise(function (resolve, reject) {
        if (!name) reject("Error (wc_btname_p), name not set");
        else {
            var to_send = str2arr(name).buffer;
            ble.write(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_BTNAME, to_send, function () {
                resolve();
            }, function (error) {
                reject(error);
            })
        }
    });
}

function write_characteristic_mmode_p(cmd) {
    return new Promise(function (resolve, reject) {
        if (!cmd) reject("Error (wc_mmode_p), cmd not set");
        var data = new Uint8Array(1);
        data[0] = cmd.charCodeAt(0);
        ble.write(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, data.buffer, function () {
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

function read_characteristic_display_p() {
    return new Promise(function (resolve, reject) {
        ble.read(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_DISPLAY, function (data) {
            var rec = arr2hex(new Uint8Array(data));
            panel.display(rec);
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

function read_characteristic_wifimac_p() {
    return new Promise(function (resolve, reject) {
        ble.read(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_WIFIMAC, function (data) {
            var rec = arr2str(new Uint8Array(data));
            window.connected_device.wifimac = rec;
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

function read_characteristic_version_p() {
    return new Promise(function (resolve, reject) {
        ble.read(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_VERSION, function (data) {
            var rec = arr2str(new Uint8Array(data));
            window.connected_device.version = rec;
            resolve();
        }, function (error) {
            reject(error);
        })
    });
}

// function read_characteristic_mmode() {
//     ble.read(window.connected_device.id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_MMODE, function (data) {
//         var rec = arr2str(new Uint8Array(data));
//         console.log("Recibio mmode: ", rec);
//     }, function (error) {
//         console.log('Error reading characteristic mmode: ', error);
//     })
// }

function get_connected_p() {
    return new Promise(function (resolve, reject) {
        if (device.platform.match(/iOS/)) {
            ble.connectedPeripheralsWithServices(
                [SERVICE_UUID_OPERATION],
                function (res) { resolve(res); },
                function (err) { reject(err); });
        }
        else if (device.platform.match(/Android/)) {
            ble.bondedDevices(
                function (res) { resolve(res); },
                function (err) { reject(err); });
        }
        else resolve([]);
    });
}

async function disconnect_all_p() {
    let connected = await get_connected_p();
    if (typeof connected !== 'object') return (connected);
    if (connected.length === 0) return ('Done');
    for (let i = 0; i < connected.length; i++) {
        window.connected_device = { id: connected[i].id };
        console.log('Disconnecting holded connection to ' + window.connected_device.id);
        await disconnect_p();
    }
}

function bleconnected() {
    console.log("Connected...");
    window.connected_device = {
        id: window.selected_device.id,
        name: window.selected_device.name,
        pass: window.selected_device.pass
    };
    subscribe_characteristic_mmode();
    subscribe_characteristic_display();
    subscribe_characteristic_cras();
    read_characteristic_wifimac_p()
        .then(read_characteristic_version_p)
        .then(read_characteristic_display_p)
        .then(write_characteristic_mcode_p)
        .then(console.log.bind(console, "Connected ok..."))
        .catch(console.log.bind(console, "Error on connect"))
}
function bledisconnected() {
    console.log("Disconnected...");
}

function conn() {
    ble.autoConnect(window.selected_device.id, bleconnected, bledisconnected);
}

async function acc_bt_disconnect_p() {
    console.log(await unsubscribe_characteristic_cras_p());
    console.log(await unsubscribe_characteristic_display_p());
    console.log(await unsubscribe_characteristic_mmode_p());
    console.log(await disconnect_p());
};

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


function scan_and_display_list() {
    ble.isEnabled(async function () {
        // $("#devs-list li:not(:first-child)").remove();
        $("#devs-list li").remove();
        if (window.known_local_devices) {
            for (const btid in window.known_local_devices) {
                const dev = window.known_local_devices[btid];
                console.log("Checking Own: " + dev.name);
                if (dev.mmode != 'M') continue;
                console.log("Adding local: " + dev.name);
                let node = document.createElement('LI');
                node.setAttribute('data-sort-text', 'A' + dev.name);
                node.setAttribute('data-btname', dev.name);
                node.setAttribute('data-wifimac', dev.wifimac);
                node.setAttribute('data-icon', 'false');
                const token = await digestMessage(dev.wifimac + window.acc_mcode + dev.pass);
                node.setAttribute('data-ws', window.acc_wsbase + dev.wifimac + '/' + token);
                let anchor = document.createElement('A');
                anchor.className = "fa fa-wifi";
                anchor.setAttribute('href', '#');
                let textnode = document.createTextNode('\u00A0\u00A0' + dev.name);
                anchor.appendChild(textnode);
                node.appendChild(anchor);
                document.getElementById('devs-list').appendChild(node);
                console.log("Remote own generated: " + dev.name);
            }
        } else { console.log("No known_local_devices") }
        if (window.known_remote_devices) {
            for (const wifimac in window.known_remote_devices) {
                const dev = window.known_remote_devices[wifimac];
                console.log("Adding shared: " + dev.name);
                let node = document.createElement('LI');
                node.setAttribute('data-sort-text', 'B' + dev.name);
                node.setAttribute('data-btname', dev.name);
                node.setAttribute('data-wifimac', wifimac);
                node.setAttribute('data-icon', 'fas-delete');
                node.setAttribute('data-ws', dev.ws);
                let anchor = document.createElement('A');
                anchor.className = "fa fa-wifi";
                anchor.setAttribute('href', '#');
                anchor.appendChild(document.createTextNode('\u00A0\u00A0' + dev.name));
                node.appendChild(anchor);
                let anchor2 = document.createElement('A');
                anchor2.setAttribute('href', '#delete-device-dialog');
                anchor2.setAttribute('data-rel', 'popup');
                anchor2.appendChild(document.createTextNode('delete'));
                node.appendChild(anchor2);
                document.getElementById('devs-list').appendChild(node);
                console.log("Remote generated: " + dev.name);
            }
        } else { console.log("No known_remote_devices") }
        $('#devs-list').listview("refresh");
        ble.startScan([SERVICE_UUID_OPERATION], function (device) {
            // if (/Acc/.exec(device.name) !== null) {
            if (device.id) {
                var name = 'advertising' in device ? device.advertising.kCBAdvDataLocalName || device.name : device.name;
                console.log("Device found: ", name);
                var node = document.createElement('LI');
                node.setAttribute('data-sort-text', 'C' + name);
                node.setAttribute('data-btname', name);
                node.setAttribute('data-btid', device.id);
                node.setAttribute('data-icon', 'false');
                var anchor = document.createElement('A');
                anchor.className = "fab fa-bluetooth";
                anchor.setAttribute('href', '#');
                var textnode = document.createTextNode('\u00A0\u00A0' + name);
                anchor.appendChild(textnode);
                node.appendChild(anchor);

                document.getElementById('devs-list').appendChild(node);
                sortDeviceList();
                // jquery mobile specific reformat of list
                $('#devs-list').listview("refresh");
            }
        }, function (error) {
            navigator.notification.alert("Could not scan");
            console.log("Could not scan", error);
        });

    }, function (error) {
        navigator.notification.alert("Bluetooth is disabled", error);
    });
}


async function base_navigation() {
    if (window.acc_on && window.selected_device) {
        panel.display("000000000000");
        ble.stopScan(
            function () { console.log('Scan stopped') },
            function (err) { console.log("Couldn't stop scan: ", err) }
        ); // just in case
        document.getElementById('connected-device-name').innerHTML = '';
        if (window.selected_device.remote) {
        } else { // bluetooth case
            // sometimes we need to start scan before the autoconnect
            // we don't actually need the results, see the dummy success & error callbacks
            // var node = document.createElement('P');
            let icon = document.getElementById('connected-device-icon');
            const white_color = 'color:rgb(255,255,255);';
            icon.setAttribute('style', white_color);
            icon.className = 'fas fa-spinner fa-spin';
            window.connected_device_logo_status = 1;
            let textnode = document.createTextNode('\u00A0\u00A0' + window.selected_device.name);
            document.getElementById('connected-device-name').appendChild(textnode);
            ble.startScan([SERVICE_UUID_OPERATION], function () { }, function () { });
            conn();
            $.mobile.navigate('#main-page');
        }
    } else {
        if (window.connected_device && window.connected_device.id) {
            console.log('before discon()');
            var res1 = await acc_bt_disconnect_p(); // ok even no device connected
            console.log('after discon()', res1);
            // var res2 = await disconnect_all_p();
            // console.log('after disconnect_all_p()', res);
            window.connected_device = null;
            let icon = document.getElementById('connected-device-icon');
            icon.removeAttribute('style');
            icon.removeAttribute('class');
            window.connected_device_logo_status = 0;
        }
        $.mobile.navigate('#device-list-page');
        scan_and_display_list();
    }
}

function myinspect(e) {
    console.log(e);
}