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

    // href.location = "index.html#controlpage";
    $.mobile.changePage("#controlpage");

    document.getElementById('canvas').innerHTML = frames[device];

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
    
    $('#submitTemp').click(function () {
        var temp = $('#slider-1').val();
        alert("you submitted " + temp);
    });
    
    $('#submitTsession').click(function () {
        var tsession = $('#slider-2').val();
        alert("you submitted " + tsession);
    });

    device == "spa" ? $('#enableSessionTime').hide() : $('#enableSessionTime').show()
    
    $('#submitTzone').click(function () {
        var tzone = $('#tz').val();
        alert("you submitted " + tzone);
    });
    
    $('.form-control').timezones();
    // initpanel();
    
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
            //        display(randhex());
            //        alert("codigo#: "+$(this).data("b"));
            var bdata = $(this).data("b");
            var tout = bdata == 6 ? 1000 : 1000;
            // if (websocket !== '') websocket.send(bdata)
            // else $("#pressedkey").text(bdata);
            $(this).attr("style", $(this).data("int"));
            var mytimer = setTimeout(function () { this.resetbuttons() }, tout);
            $(this).data("timer", mytimer);
        });
        rid++;
    }
}