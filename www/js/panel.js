window.panel = {
    // mode: MODES.REMOTE, // starts on remote by default 
    buttons: { 2: 'aux', 3: 'jets', 4: 'system', 7: 'aux2', 6: 'light', 8: 'down', 9: 'up', 10: 'set-time', 11: 'set-temp' },
    buttons_codes: {
        'aux': 'x0', 'jets': 'j0', 'system': 's0', 'light': 'l0', 'aux2': 'a0',
        'down': 'd0', 'up': 'u0', 'set-time': 'd1', 'set-temp': 'u1'
    },
    openWebsocket: function () {
        // get url from current spa


        // appws = new WebSocket("ws://accsmartlink.com/wsa");
        let appws = new WebSocket("ws://localhost:3001/wsa");

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
            let button = panel.buttons_codes[panel.buttons[b]] + '\0';

            $("#button-" + panel.buttons[b] + "-frame").on("vclick", function () { // inside the function, 'this' is the html object that was clicked
                var tout = 1000;
                $(this).attr("style", $(this).data("int"));
                transmitter.send_to_module("keyboard", button);
                let self = this;
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
            temp_min_f: 45,
            temp_max_c: 40,
            temp_min_c: 7.6,
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

        let device_limits = this.device_limits;
        let f2c = this.f2c;
        $("#flip-scale").on("change", function () {
            var scale = this.value;
            if (scale == 0) {
                $("#slider-temp").attr("min", device_limits[type].temp_min_f)
                    .attr("max", device_limits[type].temp_max_f)
                    .attr("step", 1).val($("#slider-2-temp").val());
            }
            else {
                var cval = f2c($("#slider-2-temp").val());
                $("#slider-temp").attr("min", device_limits[type].temp_min_c)
                    .attr("max", device_limits[type].temp_max_c)
                    .attr("step", .1).val(cval);
            }
        });
        $("#flip-scale").change();

        let oldvalue = $("#slider-temp").attr("value");
        $("#slider-temp").change(function () {
            if ($("#flip-scale").val() == 1) {
                var number = parseFloat(this.value);
                if (!(number <= device_limits[type].temp_max_c && number >= device_limits[type].temp_min_c)) number = f2c(parseFloat(oldvalue));
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
                if (!(this.value <= device_limits[type].temp_max_f && this.value >= device_limits[type].temp_min_f)) this.value = oldvalue;
                $("#slider-2-temp").val(this.value);
            }
        }).change();

        $("#submit-temp").on('click', function () {
            // alert("submitted temp " + $("#slider-temp").val());
            transmitter.send_to_module("keyboard", $("#slider-temp").val() + ($("#flip-scale").val() == 1 ? "C" : "F"))
        });

        // var slider_session = new Slider("session", 10, MAX_SESSION, MIN_SESSION, bt_module);

        $("#slider-session").attr("min", device_limits[type].session_min);
        $("#slider-session").attr("max", device_limits[type].session_max);
        $("#slider-session").change(function () {
            $("#slider-session").val(this.value);
        }).change();
        $("#submit-session").on('click', function () {
            // alert("submitted session " + $("#slider-session").val());
            transmitter.send_to_module("keyboard", $("#slider-session").val());

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
            ble.read(bluetooth.connected_id, SERVICE_UUID_OPERATION, CHARACTERISTIC_UUID_DISPLAY,
                function (data) {
                    let screen = Array.from(new Uint8Array(data),
                        function (item) {
                            hex_num = item.toString(16);
                            return hex_num.length > 1 ? hex_num : hex_num + "0";
                        }).join('');
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
    },
    load_device: function () {
        $("#panel-title").text(current_device.name);
        document.getElementById('canvas').innerHTML = window.frames[current_device.type];
        panel.link_buttons();
        panel.init_leds();
        panel.set_sliders(current_device.type);
    }
}