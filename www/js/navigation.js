var index_ids = {
    available_systems: "available-systems"
}

ConnectNewDevice = PClass.create({
    init: function(bluetooth_scanner, bluetooth_device, registration){
        this.bluetooth_scanner = bluetooth_scanner;
        this.bluetooth_device = bluetooth_device;
        this.registration = registration;
        // this.object_id = $(`#${object_id}`);

        this.scan_result_list = $("#scan-result-list");
        this.scan_button = $("#button-start-stop-scan");
        this.scan_loader_animation = $("#scan-loader-animation");
        this.scan_loader_animation.hide();
        this.connect_button = $("#button-connect-to-device");
        this.device_to_connect = "";
        this.scanning = false;
        let self = this;

        this.scan_button.on('click', function (){
            if (self.scanning === false){
                self.scan_loader_animation.show();
                self.scanning = true;
                self.bluetooth_scanner.startScan(self.scan_result_list);
            }
            else{
                self.scan_loader_animation.hide();
                self.scanning = false;
                self.bluetooth_scanner.stopScan();
            }
        });

        this.scan_result_list.on('click', 'li', function () {
            self.connect_button.removeClass("ui-state-disabled");
            self.device_to_connect = $(this).find("a").text();
        });

        this.connect_button.on('click', function () {
            bluetooth_device.connect(self.bluetooth_scanner.devices[self.bluetooth_scanner.devices.indexOf(self.device_to_connect)]);
            $.mobile.changePage(self.registration.page_id, { transition: "slidedown", changeHash: false });
            self.registration.device_name = self.device_to_connect;
        });


    }
})

Registration = PClass.create({
    init: function(connection_interface, device_name) {
        this.connection_interface = connection_interface;
        this.device_name = "...";
        this.page_id = "#registration-page";
        this.submit_button = $("#submit-register-button");
        this.ssid = $("#ssid");
        this.ssid_pass = $("#ssid-pw");
        this.email = $("#email-address");
        this.email_conf = $("#email-address-confirm");
        let self = this;

        this.submit_button.on('click', function () {
            if(!this.ssid.val() || !this.ssid_pass.val() || !this.email.val() || !this.email_conf.val())
                alert("Please fill in all the fields");
            else if (this.email !== this.email_conf)
                alert("E-mails do not match");
            else{
                alert("Sending data to server");
                $.mobile.changePage("#start-page", { transition: "slidedown", changeHash: false });
                alert("Device registered!");
                $("#available-systems").prepend(`<a data-position-to="window" \
                class= "device ui-mini ui-btn ui-btn-inline" \
                data-transition="pop" > ${self.device_name} </a >`);
            }
        });


    },  
    register: function(username, password, email){
        this.connection_interface.sendMessage({
                "username": username,
                "password": password,
                "email": email
            });
    }
});


AvailableSystems = PClass.create({
    init: function(object_id) {
        this.object_id = $(`#${object_id}`);
        this.list_o = `${object_id}_list`;
    },
    add_device: function(name) {
        this.object_id.prepend(`<a data-position-to="window" class= "device-button device ui-mini ui-btn ui-btn-inline" \
                                    data-transition="pop">${name}</a>`);
    }

});



window.onload = function () {  

    available_systems = new AvailableSystems(index_ids.available_systems);
    connection = new Dry(); // for testing until tests are done
    registration = new Registration(connection);
    
    spaBluetoothConnection = new DeviceBluetooth(SERVICE_UUID, CHARACTERISTIC_UUID_READ, true);
    scanner = new BluetoothScanner(true);
    connect_window = new ConnectNewDevice(scanner, spaBluetoothConnection, registration.page_id);
    
    document.getElementById('canvas').innerHTML = window.frames["spa"];
    // $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
    

    var button_system = new Button("system", "s0", connection);
    var button_light = new Button("light", "l0", connection);
    var slider_session = new Slider("session", 10, MAX_SESSION, MIN_SESSION, connection);
    slider_session.set_change_function();
    var slider_temp = new SliderTemp("temp", 
                            50, 
                            MAX_TEMP_FAR_SPA,
                            MIN_TEMP_FAR_SPA,
                            MAX_TEMP_CEL_SPA, 
                            MIN_TEMP_CEL_SPA, 
                            connection, 
                            $("#flip-scale"));
    slider_temp.set_change_function();

    new TimeZoneSelector("time-zone-selector", "form-timezones", "submit-time-zone", connection);

    // var type = "spa";
    // var panel;
   

    // var scanning = false;
    // var it = 1;
    // var deviceName = "";
    // $('#scan-loader-animation').hide();
    // $("#button-start-stop-scan").on('click', function(){
    //     if(scanning){
    //         $('#scan-loader-animation').hide();
    //         scanning = false;
    //         // $("#scan-result-list").append('<li> <a class="ui-btn ui-btn-icon-right ui-icon-carat-r">device ' + it + '</a> </li>');
    //         // it++;
    //         stopScan();
    //         $('#button-connect-to-device').addClass("ui-state-disabled");
    //     }
    //     else{
    //         $('#scan-loader-animation').show();
    //         scanning = true;
    //         startScan();
    //     }
    // });
    
    // $('#scan-result-list').on('click','li', function () {
    //     $('#button-connect-to-device').removeClass("ui-state-disabled");  
    //     deviceName = $(this).find("a").text();
    // });
    
    // $('#button-connect-to-device').on('click', function(){
    //     btConnect(accDevicesIds[deviceName]);
    // });
    
    // $("#submit-register-button").on('click', function(){
    //     $.mobile.changePage("#start-page", { transition: "slidedown", changeHash: false });
    //     $("#available-systems").prepend('<a data-position-to="window" \
    //                 class= "device ui-mini ui-btn ui-btn-inline" \
    //                 data-transition="pop" > New Device</a >');
    // });

    $(document).on('click', ".device", function () {
        $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
        setScreen("spa");
    });


}

function setScreen(device) {
    var templims;
    $('#name').html("<h1>Acc " + device.capitalize() + "</h1>");
    document.getElementById('canvas').innerHTML = frames[device];

    if (device == "spa") {
        templims = { f: { min: 45, max: 104 }, c: { min: 7.6, max: 40 } };
        $('#enableSessionTime').hide();
    }
    else if (device == "sauna") {
        templims = { f: { min: 50, max: 160 }, c: { min: 10.3, max: 70.8 } };
        $('#enableSessionTime').show();
    }

    $('#submitTemp').click(function () {
        var temp = $('#slider-temp').val();
        alert("you submitted " + temp);
        ws.send(temp);
    });

    $('#submitTsession').click(function () {
        var tsession = $('#slider-2-session').val();
        alert("you submitted " + tsession);
        ws.send(tsession);
    });

    $('#submitTzone').click(function () {
        var tzone = $('#tz').val();
        alert("you submitted " + tzone);
    });


    $('.form-control').timezones();

    $(".ui-slider-label-b").addClass('ui-btn-active');
    $(".ui-slider-track").css('background', '#22aadd');
    var oldvalue = $("#slider-temp").attr("value");


    $('#slider-temp').change(function () {
        if ($("#flip-scale").val() == 1) {
            var number = parseFloat(this.value);
            if (!(number <= templims.c.max && number >= templims.c.min)) number = f2c(parseFloat(oldvalue));
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
            $("#slider-F-temp").val(far.toFixed(0));
        }
        else {
            if (!(this.value <= templims.f.max && this.value >= templims.f.min)) this.value = oldvalue;
            $("#slider-F-temp").val(this.value);
        }
    }).change();

    $("#slider-2-session").change(function () {
        $("#slider-session").val(this.value);
    }).change();

    $("#flip-scale").on("change", function () {
        var scale = this.value;
        var textslider = '';
        if (scale == 0) {
            textslider = 'Slider (°F):';
            $("#slider-temp").attr("min", templims.f.min).attr("max", templims.f.max).attr("step", 1).val($("#slider-F-temp").val());
        }
        else {
            textslider = 'Slider (°C):';
            var cval = f2c($("#slider-F-temp").val());
            $("#slider-temp").attr("min", templims.c.min).attr("max", templims.c.max).attr("step", .1).val(cval);
        }
        //    $("#slider-label").text(textslider);
    });
    $("#flip-scale").change();
    $("#slider-temp").on('tap', function () {
        this.value = ''
    });

    $("#slider-temp").bind('blur', function (e) {
        $("#slider-temp").change();
    });

    $("#slider-temp").on('slidestop', function (e) {
        $("#slider-temp").change();
    });


    var mybuttons = { 2: 'aux', 3: 'jets', 4: 'system', 7: 'aux2', 6: 'light' };

    var rects = new Array(5);
    var rid = 0;

    this.resetbuttons = function () {
        for (var rid = 0; rid < 5; rid++) {
            if (rects[rid] == undefined) continue; // unused button
            if (rects[rid].attr("style", rects[rid].data("off")) == undefined) continue; // unused button
            rects[rid].attr("style", rects[rid].data("off"))
            var mytimer = rects[rid].data("timer");
            if (mytimer !== '') {
                clearTimeout(mytimer);
                rects[rid].data("timer", '');
            }
        }
    }


    for (var b in mybuttons) {
        rects[rid] = $('#button-' + mybuttons[b] + '-frame');
        var auxonstyle = rects[rid].attr("style");
        if (auxonstyle == undefined) continue; // unused button
        var auxoffstyle = auxonstyle.replace(/stroke-opacity[^;]*;?/, "");
        var auxintstyle;
        if (auxoffstyle.length > 0) { auxoffstyle += ';' };
        auxintstyle = auxoffstyle + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff';
        auxoffstyle += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
        rects[rid].attr("style", auxoffstyle);
        rects[rid].data("b", b);
        rects[rid].data("off", auxoffstyle);
        rects[rid].data("int", auxintstyle);
        rects[rid].data("timer", '');
        rects[rid].on("click", function () {
            var bdata = $(this).data("b");
            var tout = bdata == 6 ? 1000 : 1000;
            $(this).attr("style", $(this).data("int"));
            var mytimer = setTimeout(function () { this.resetbuttons() }, tout);
            $(this).data("timer", mytimer);
        });
        rid++;
    }
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


function startScan() {
    ble.startScan([], function (device) {
        // console.log(JSON.stringify(device));
        // aux += "<li href='#'>" + JSON.stringify(device) + "</li>";
        // document.getElementById('scanned devices').innerHTML = aux;

        if (device.name == "AccControl") {
            accDevicesIds[device.name] = device.id;
            $("#scan-result-list").append('<li> <a class="found-devices ui-btn ui-btn-icon-right ui-icon-carat-r">' + device.name + '</a> </li>');
        }
    });

}
function btConnect(deviceId) {
    ble.connect(deviceId, function (device) {
        console.log("Connected to " + deviceId);
        ble.write(deviceId,
            SERVICE_UUID,
            CHARACTERISTIC_UUID_READ,
            stringToBytes("Hello from ACC Control remote application, prepare to be conquered."),
            function () { console.log("Sent conquering message"); },
            function () { console.log("Conquering failed"); }
        );
        // location.href = 'index.html#actionpage';
        // setButtons(device);
        // location.href = 'index.html';
    }, function () {
        console.log("Couldn't connect to " + deviceId);
    });
}

function stopScan() {
    ble.stopScan;
    console.log("Scan Stopped");
}

function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}