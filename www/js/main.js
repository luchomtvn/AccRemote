window.onload = function () 
{   
    // Get user information
    // Scan Wifi or bluetooth and connect
    // Display device screen (spa or sauna)
    
    var device = "";
    $('#gotoSpaPage').on('click', function () 
    {
        device = "spa";
        setScreen(device);
    });
    $('#gotoSaunaPage').on('click', function () 
    {
        device = "sauna";
        setScreen(device);
    });
}

function setScreen(device){

    
    var templims;
    $('#name').html("<h1>Acc " + device.capitalize() + "</h1>");
    $.mobile.changePage("#controlpage");
    document.getElementById('canvas').innerHTML = frames[device];

    if (device == "spa"){
        templims = { f: { min: 45, max: 104 }, c: { min: 7.6, max: 40 } };
        $('#enableSessionTime').hide();
    }
    else if (device == "sauna"){
        templims = { f: { min: 50, max: 160 }, c: { min: 10.3, max: 70.8 } };
        $('#enableSessionTime').show();
    }

    $('#submitTemp').click(function () {
        var temp = $('#slider-1').val();
        alert("you submitted " + temp);
    });
    
    $('#submitTsession').click(function () {
        var tsession = $('#slider-2').val();
        alert("you submitted " + tsession);
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