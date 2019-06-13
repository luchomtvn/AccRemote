
function randhex() {
    var sal = '';
    for (var j = 0; j < 5 ; j++) {
    var i = Math.floor(Math.random() * 256);
    sal += (i+0x10000).toString(16).substr(-2);
    }
    return sal
}


/**
* Initizes panel
*/
function initpanel (websocket) {
// First gets the style of every segment of the four digits

    var digits = [0, 1, 2, 3];
    var snames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    var segments = new Array(6);
    var onstyles = new Array(6);
    var offstyles = new Array(6);

    for (var d in digits) {
        segments[d] = new Array(8);
        for (var s in snames) {
            segments[d][s] = $("#digit-d"+d+"-s"+snames[s]);
        }
    }

// Then initializes rest of array with notification leds
    segments[4] = new Array(8);
    segments[4][0] = $("#led-heating"); // led 'system' en sauna
    segments[4][1] = $("#led-airhi"); 
    segments[4][2] = $("#led-jetslo");
    segments[4][3] = $("#led-jetshi"); // led 'heating' en sauna
    segments[4][4] = $("#led-filtering");
    segments[4][5] = $("#led-edit");
    segments[4][6] = $("#led-overheat");
    segments[4][7] = $("#led-am");

    segments[5] = new Array(8);
    segments[5][4] = $("#led-light");
    segments[5][5] = $("#led-jets2hi");
    segments[5][6] = $("#led-jets2lo");
    segments[5][7] = $("#led-airlo");

    for (var d=0;d<6;d++) {
        onstyles[d] = new Array(8);
        offstyles[d] = new Array(8);
        for (var s=0;s<8;s++) {
            if (d == 5 && s < 4) continue;
            var auxonstyle = segments[d][s].attr("style");
            if (auxonstyle == undefined) continue; // unused led
            onstyles[d][s] = auxonstyle;
            var auxoffstyle = auxonstyle.replace(/fill-opacity[^;]*;?/, "");
//            if (auxoffstyle.match(/^\s*$/)) {auxoffstyle+= ';'};
            if (auxoffstyle.length > 0) {auxoffstyle+= ';'};
            auxoffstyle += 'fill-opacity:0.1';
            offstyles[d][s] = auxoffstyle;
        }
    }

//
// Initializes buttons

// caso sauna: jets controla 'light'. aux, aux2 y light no estan.
var mybuttons = {2:'aux', 3:'jets', 4:'system', 7:'aux2', 6:'light'};
    

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
    rects[rid] = $("#button-"+mybuttons[b]+'-frame');
    var auxonstyle = rects[rid].attr("style");
    if (auxonstyle == undefined) continue; // unused button
    var auxoffstyle = auxonstyle.replace(/stroke-opacity[^;]*;?/, "");
    var auxintstyle;
    if (auxoffstyle.length > 0) {auxoffstyle+= ';'};
    auxintstyle = auxoffstyle + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff';
    auxoffstyle += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
    rects[rid].attr("style", auxoffstyle);
    rects[rid].data("b",b);
    rects[rid].data("off",auxoffstyle);
    rects[rid].data("int",auxintstyle);
    rects[rid].data("timer", '');
    rects[rid].on("click",function() {
//        display(randhex());
//        alert("codigo#: "+$(this).data("b"));
        var bdata = $(this).data("b");
        var tout = bdata == 6 ? 1000 : 10000;
        if (websocket !== '') websocket.send(bdata)
        else $("#pressedkey").text(bdata);
        $(this).attr("style", $(this).data("int"));
        var mytimer = setTimeout(function () {this.resetbuttons()}, tout);
        $(this).data("timer", mytimer);
    });
    rid++;
}


$("#canceltemp").on("click", function() {
    $("#maindisplay").click();
});
$("#canceltz").on("click", function() {
    $("#maindisplay").click();
});

this.display = function (rx) {
    $("#spascreen").text(rx);
    if (typeof(rx) == 'string' && rx.length == 12) {
        for (var ii = 0; ii < 6; ii++) {
            var dd = parseInt(rx.substring(ii*2,ii*2+2), 16);
            if (dd == 'NaN') dd = 0;
            for (var jj = 0, mm = 1;jj < 8; jj++,mm <<= 1) {
                if (ii == 5 && jj < 4) continue;
                if (segments[ii][jj].attr("style") == undefined) continue; // unused led
                segments[ii][jj].attr("style",(mm & dd) ? onstyles[ii][jj] : offstyles[ii][jj])
                }
            }
        }
    }
return this;
}
