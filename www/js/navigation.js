var SERVICE_UUID = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";
var accDevicesIds = {};

window.onload = function () {   
    var scanning = false;
    var it = 1;
    var deviceName = "";
    $('#scan-loader-animation').hide();
    $("#button-start-stop-scan").on('click', function(){
        if(scanning){
            $('#scan-loader-animation').hide();
            scanning = false;
            // $("#scan-result-list").append('<li> <a class="ui-btn ui-btn-icon-right ui-icon-carat-r">device ' + it + '</a> </li>');
            // it++;
            stopScan();
            $('#button-connect-to-device').addClass("ui-state-disabled");
        }
        else{
            $('#scan-loader-animation').show();
            scanning = true;
            startScan();
        }
    });
    
    $('#scan-result-list').on('click','li', function () {
        $('#button-connect-to-device').removeClass("ui-state-disabled");  
        deviceName = $(this).find("a").text();
    });
    
    $('#button-connect-to-device').on('click', function(){
        btConnect(accDevicesIds[deviceName]);
    });
    
    $("#submit-register-button").on('click', function(){
        $.mobile.changePage("#start-page", { transition: "slidedown", changeHash: false });
        $("#available-systems").prepend('<a data-position-to="window" \
                    class= "device ui-mini ui-btn ui-btn-inline" \
                    data-transition="pop" > New Device</a >');
    });

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
        var temp = $('#slider-1').val();
        alert("you submitted " + temp);
        ws.send(temp);
    });

    $('#submitTsession').click(function () {
        var tsession = $('#slider-2').val();
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
    var oldvalue = $("#slider-1").attr("value");


    $('#slider-1').change(function () {
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
            $("#slider-F").val(far.toFixed(0));
        }
        else {
            if (!(this.value <= templims.f.max && this.value >= templims.f.min)) this.value = oldvalue;
            $("#slider-F").val(this.value);
        }
    }).change();

    $("#slider-2").change(function () {
        $("#slider-T").val(this.value);
    }).change();

    $("#flip-scale").on("change", function () {
        var scale = this.value;
        var textslider = '';
        if (scale == 0) {
            textslider = 'Slider (°F):';
            $("#slider-1").attr("min", templims.f.min).attr("max", templims.f.max).attr("step", 1).val($("#slider-F").val());
        }
        else {
            textslider = 'Slider (°C):';
            var cval = f2c($("#slider-F").val());
            $("#slider-1").attr("min", templims.c.min).attr("max", templims.c.max).attr("step", .1).val(cval);
        }
        //    $("#slider-label").text(textslider);
    });
    $("#flip-scale").change();
    $("#slider-1").on('tap', function () {
        this.value = ''
    });

    $("#slider-1").bind('blur', function (e) {
        $("#slider-1").change();
    });

    $("#slider-1").on('slidestop', function (e) {
        $("#slider-1").change();
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



function f2c(far) {
    var stepval = far - 45;
    stepval = stepval.toFixed(0);
    var hstepval = Math.floor(stepval / 2);
    var cval = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
    return cval.toFixed(1);
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