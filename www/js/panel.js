window.panel = {
    // mode: MODES.REMOTE, // starts on remote by default 
    buttons: { 2: 'aux', 3: 'jets', 4: 'system', 7: 'aux2', 6: 'light', 8: 'down', 9: 'up', 10: 'set-time', 11: 'set-temp' },
    buttons_codes: {
        'aux': 'x0', 'jets': 'j0', 'system': 's0', 'light': 'l0', 'aux2': 'a0',
        'down': 'd0', 'up': 'u0', 'set-time': 'd1', 'set-temp': 'u1'
    },
    reset_buttons: function () {
        for (var b in this.buttons) {
            $("#button-" + this.buttons[b] + "-frame").attr("style", $("#button-" + this.buttons[b] + "-frame").data("off"));
            var mytimer = $("#button-" + this.buttons[b] + "-frame").data("timer");
            if (mytimer !== '') {
                clearTimeout(mytimer);
                $("#button-" + this.buttons[b] + "-frame").data("timer", '');
            }
        }
    },
    link_buttons: function () {

        for (var b in this.buttons) {
            let on_style = $("#button-" + this.buttons[b] + "-frame").attr("style");
            if (on_style == undefined) continue; // unused button
            let off_style = on_style.replace(/stroke-opacity[^;]*;?/, "");
            if (off_style.length > 0) { off_style += ';' };
            off_style += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
            $("#button-" + this.buttons[b] + "-frame").attr("style", off_style);
            // $("#button-" + this.buttons[b] + "-frame").data("b", 0);
            $("#button-" + this.buttons[b] + "-frame").data("off", off_style);
            $("#button-" + this.buttons[b] + "-frame").data("int", off_style + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff');
            $("#button-" + this.buttons[b] + "-frame").data("timer", '');
            let button = this.buttons_codes[this.buttons[b]];

            $("#button-" + this.buttons[b] + "-frame").on("vclick", function () { // inside the function, 'this' is the html object that was clicked
                let tout = window.selected_device && window.selected_device.id ? 250 : 1000;
                $(this).attr("style", $(this).data("int"));
                transmitter.send_to_module("keyboard", button);
                var self = this;
                var mytimer = setTimeout(function () {
                    $(self).attr("style", off_style);
                }, tout);
                $(this).data("timer", mytimer);
            });
        }
    },
    device_limits: {
        spa: {
            temp_max_f: 104,
            //    temp_min_f: 45,
            temp_min_f: 40,     // new spec
            temp_max_c: 40,
            // temp_min_c: 7.6,
            temp_min_c: 4.8,    // new spec
        },
        sauna: {
            temp_max_f: 160,
            temp_min_f: 50,
            temp_max_c: 70.8,
            temp_min_c: 10.3,
            session_max: 60,
            session_min: 10
        }
    },
    set_sliders: function (type) {
        if (type === "spa")
            $("#session-time").hide();
        else if (type === "sauna")
            $("#session-time").show();
        $("#flip-scale").on("change", function () {
            let far = document.getElementById('slider-2-temp').value;
            let div = document.querySelector('#slider-temp + div > a'); // jqm aux div
            if (this.value == 1) { // ºC
                let cval = panel.f2c(far);
                $("#slider-temp").attr("min", 4.8)
                    .attr("max", 40)
                    .attr("value", cval)
                    .attr("step", .1).val(cval);
                if (div) {
                    div.setAttribute('aria-valuemin', 4.8);
                    div.setAttribute('aria-valuemax', 40);
                    div.setAttribute('aria-valuenow', cval);
                    div.setAttribute('aria-valuetext', cval);
                }
            }
            else {  // ºF
                $("#slider-temp").attr("min", 40)
                    .attr("max", 104)
                    .attr("step", 1).val(far);
                if (div) {
                    div.setAttribute('aria-valuemin', 40);
                    div.setAttribute('aria-valuemax', 104);
                    div.setAttribute('aria-valuenow', far);
                    div.setAttribute('aria-valuetext', far);
                }
            }
        });
        $("#flip-scale").change();
        $("#slider-temp").change(function () {
            let div = document.querySelector('#slider-temp + div > a'); // jqm aux div
            if ($("#flip-scale").val() == 1) {
                let far = panel.c2f(parseFloat(this.value));
                let cval = panel.f2c(far);
                this.value = cval;
                $("#slider-2-temp").val(far);
                if (div) {
                    div.setAttribute('aria-valuenow', cval);
                    div.setAttribute('aria-valuetext', cval);
                }
            }
            else {
                let far = this.value;
                $("#slider-2-temp").val(far);
                if (div) {
                    div.setAttribute('aria-valuenow', far);
                    div.setAttribute('aria-valuetext', far);
                }
            }
        }).change();
        $("#submit-temp").on('click', function () {
            // alert("submitted temp " + $("#slider-temp").val());
            let res = '';
            if (document.getElementById('flip-scale').value) {
                // scale is ºC 
                res = ('000' + (document.getElementById('slider-temp').value * 10).toFixed(0) + 'C').slice(-4);
            } else {
                // scale is ºF 
                res = ('000' + document.getElementById('slider-temp').value + 'F').slice(-4);
            }
            transmitter.send_to_module("temperature", res);
        });
        $("#slider-session").attr("min", panel.device_limits[type].session_min);
        $("#slider-session").attr("max", panel.device_limits[type].session_max);
        $("#slider-session").change(function () {
            $("#slider-session").val(this.value);
        }).change();
        $("#submit-session").on('click', function () {
            // alert("submitted session " + $("#slider-session").val());
            transmitter.send_to_module("session", $("#slider-session").val());
        });
    },
    set_callbacks: function () {
        document.getElementById('canceltemp').addEventListener('click', function (ev) {
            document.getElementById('temperature-header').click();
        });
    },
    f2c: function (f) // fahrenheit to celsius
    {
        return (((f % 2)
            ? (f - 1) * 11 / 2 - 166
            : f * 11 / 2 - 172) * .1).toFixed(1);
    },
    c2f: function (c) // celsius to fahrenheit
    {
        c *= 10;
        c += 3;
        let delta = c % 11;
        let res = (c - delta) * 2 / 11 + 31;
        return ((delta > 4) ? res + 1 : res).toFixed(0);
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
    scale_selected: null,
    display: function (rx) {
        if (typeof (rx) == 'string' && rx.length == 12) {
            for (var ii = 0; ii < 6; ii++) {
                var dd = parseInt(rx.substring(ii * 2, ii * 2 + 2), 16);
                if (dd == 'NaN') dd = 0;
                for (var jj = 0, mm = 1; jj < 8; jj++, mm <<= 1) {
                    if (ii == 5 && jj < 4) continue;
                    if (this.segments[ii][jj].attr("style") == undefined) continue; // unused led
                    this.segments[ii][jj].attr("style", (mm & dd) ? this.onstyles[ii][jj] : this.offstyles[ii][jj])
                }
            };
            if (this.scale_selected) return; // just once, check for ºF or ºC and preselect scale
            if (rx.match(/^b9/i)) {
                this.scale_selected = 1;
                $('#flip-scale').val(1).change();
            }
            else if (rx.match(/^f1/i)) {
                this.scale_selected = 1;
                $('#flip-scale').val(0).change();
            }
        }
    },
    load_device: function () {
        // $("#panel-title").text("spa");
        document.getElementById('canvas').innerHTML = window.frames["spa"];
        document.getElementById('canvas').setAttribute("align", "center");
        panel.link_buttons();
        panel.init_leds();
        panel.set_sliders("spa");
        panel.set_callbacks();
    }
}