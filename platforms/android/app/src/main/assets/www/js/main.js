var SERVICE_UUID = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_TOGGLE = "c852651d-bcb7-4ca7-bbd7-2c13e99608e8";

// var log = document.getElementById("log");
// if (window.cordova) {
//     log.innerHTML = "with cordova";
//     document.addEventListener("deviceready", function onDeviceReady() {
//         log.innerHTML = "deviceready";
//     }, false);
// } else {
//     log.innerHTML = "with browser";
// }

// document.addEventListener('deviceready', function () {
//     console.log('Received Event: deviceready');
// }, false);

document.getElementById('beginScan').addEventListener('click', function (e) {
    var aux = "";
    ble.startScan([], function (device) {
        console.log(JSON.stringify(device));
        aux += '<button href="#" name="' + device.name + '" id= "' + device.name + '"/>'
        aux += '<label for="' + device.name + '">' + device.name + "</label>";
        // aux += "<li href='#'>" + JSON.stringify(device) + "</li>";
        document.getElementById('scanned devices').innerHTML = aux;

        if (device.name == "AccControl") {
            ble.connect(device.id, function (device) {
                ble.stopScan;
                console.log("Scan Stopped");
                console.log("Connected to " + device.name + ":" + device.id);
                location.href = 'index.html#actionpage';
                setButtons(device);
            }, function (device) {
                console.log("Disconnected from " + device.name);
                location.href = 'index.html';
            });
        }
    });

    setTimeout(ble.stopScan,
        5000,
        function () { console.log("Scan complete"); },
        function () { console.log("stopScan failed"); }
    );

});



function setButtons(device) {
    $("#ledOn").click(function () {
        ble.write(device.id,
            SERVICE_UUID,
            CHARACTERISTIC_UUID_TOGGLE,
            stringToBytes("on"),
            function () { console.log("turned led on"); },
            function () { console.log("didn't turn led on"); }
        );
    });
    $("#ledOff").click(function () {
        ble.write(device.id,
            SERVICE_UUID,
            CHARACTERISTIC_UUID_TOGGLE,
            stringToBytes("off"),
            function () { console.log("turned led off"); },
            function () { console.log("didn't turn led off"); }
        );
    });
    $("#sendText").click(function () {
	    var textToSend = document.getElementById("textToSend").value;
	    ble.write(device.id,
	        SERVICE_UUID,
	        CHARACTERISTIC_UUID_READ,
	        stringToBytes(textToSend),
	        function (e) { console.log("recieved text"); },
	        function (e) { console.log("didn't recieve text: " + e); }
	    );
    });
}
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}