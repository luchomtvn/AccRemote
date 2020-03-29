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
    prepare: function (type) {
        panel.product_type = type;
        panel.temp_unit = 'F';
        document.getElementById("session-container").style.display =
            (panel.product_type === "sauna") ? 'inline' : 'none';
        if (!selected_device) return; // this is really an error
        let tz_cont = document.getElementById('time-zone-container');
        let adv_cont = document.getElementById('advanced-configuration-container');
        adv_cont.style.display = "none"; // will be restarted later for master accesses
        if (selected_device.ws) {
            let mode = selected_device.ws.match(/\/\w{12}\/M\/\d{10}\/\w{64}$/);
            tz_cont.style.display = mode ? "inline" : "none";
        } else tz_cont.style.display = "none";
        // other containers will be displayed or not when mmode characteristic is notified on BT
        return
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
        $("#slider-session").attr("min", panel.device_limits[panel.product_type].session_min);
        $("#slider-session").attr("max", panel.device_limits[panel.product_type].session_max);
        $("#slider-session").change(function () {
            $("#slider-session").val(this.value);
        }).change();
        $("#submit-session").on('click', function () {
            // alert("submitted session " + $("#slider-session").val());
            transmitter.send_to_module("session", $("#slider-session").val());
        });
    },
    collapse_all: function () {
        let colls = $('div[data-role="collapsible"]');
        for (let i = 0; i < colls.length; i++)
            $(colls[i]).collapsible('collapse');
    },
    show_temp_slider: function () {
        const sel = 'slider-temp-' + panel.temp_unit + '-' + panel.product_type + '-container';
        const all = [
            'slider-temp-F-spa-container',
            'slider-temp-C-spa-container',
            'slider-temp-F-sauna-container',
            'slider-temp-C-sauna-container'
        ];
        all.forEach(function (item) {
            if (item == sel)
                document.getElementById(sel).style.display = "inline";
            else document.getElementById(item).style.display = "none";
        });
    },
    init_all: function () {
        document.getElementById('canceltemp').addEventListener('click', function (ev) {
            document.getElementById('temperature-header').click();
        });
        document.getElementById('cancelsession').addEventListener('click', function (ev) {
            document.getElementById('temperature-header').click();
        });
        document.getElementById('canceltime').addEventListener('click', function (ev) {
            document.getElementById('set-device-time-header').click();
        });
        document.getElementById('canceltz').addEventListener('click', function (ev) {
            document.getElementById('set-device-time-zone-header').click();
        });
        panel.show_temp_slider();

        $("#flip-scale").on("change", function () {
            let new_id = '';
            if (this.value == 1 && panel.temp_unit == 'F') { // ºC
                panel.temp_unit = 'C';
                new_id = 'slider-temp-C-' + panel.product_type;
                let far = document.getElementById('slider-temp-F-' + panel.product_type).value;
                document.getElementById(new_id).value = panel.f2c(far);
            }
            else if (this.value == 0 && panel.temp_unit == 'C') {  // ºF
                panel.temp_unit = 'F';
                new_id = 'slider-temp-F-' + panel.product_type;
                let cel = document.getElementById('slider-temp-C-' + panel.product_type).value;
                document.getElementById(new_id).value = panel.c2f(cel);
            }
            if (new_id) {
                panel.show_temp_slider();
                $('#' + new_id).slider('refresh');
            }
        }).change();
        document.getElementById("submit-temp").addEventListener('click', function () {
            // alert("submitted temp " + $("#slider-temp").val());
            let res = '';
            if (panel.temp_unit == 'C') {
                // scale is ºC 
                let id = 'slider-temp-C-' + panel.product_type;
                let cel = document.getElementById(id).value;
                let far = panel.c2f(cel);
                cel = panel.f2c(far);
                document.getElementById(id).value = cel;
                $('#' + id).slider('refresh');
                res = ('000' + (cel * 10).toFixed(0) + 'C').slice(-4);
            } else {
                // scale is ºF 
                res = ('000' + document.getElementById('slider-temp-F-' + panel.product_type).value + 'F').slice(-4);
            }
            transmitter.send_to_module("temperature", res);
        });
        document.getElementById("submit-session").addEventListener('click', function () {
            // alert("submitted temp " + $("#slider-temp").val());
            let res = document.getElementById('slider-session').value;
            res = ('00' + res).slice(-3);
            transmitter.send_to_module("session", res);
        });
        // initializes TZones. Note this should be called just once, and after devicereay
        let current_tz = Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Choose TZ ...';
        document.getElementById('time-zone-selector').innerHTML =
            '<option>' +
            current_tz +
            '</option>' +
            getTZs();
        document.getElementById("submit-time-zone").addEventListener('click', function () {
            let tz = document.getElementById('time-zone-selector').value;
            let d = new Date().toLocaleString("en-US", { timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: true });
            transmitter.send_to_module("time", d);
        });
        document.getElementById("submit-time").addEventListener('click', function () {
            let d = new Date().toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
            transmitter.send_to_module("time", d);
            document.getElementById('set-device-time-header').click();
        });
        $("#wifi-container").on("collapsibleexpand", function () {
            let t_counter = 0;
            document.getElementById('ssid').innerHTML = '';
            window.acc_1_second_timer = setInterval(function () {
                if (window.connected_device &&
                    window.connected_device.id
                ) {
                    if (!(t_counter % 10)) write_characteristic_mmode_p('Z');
                    else if (
                        !(t_counter % 2)) write_characteristic_mmode_p('W');
                    t_counter++;
                }
            }, 1000);
        });
        $("#wifi-container").on("collapsiblecollapse", function () {
            if (window.acc_1_second_timer) clearInterval(window.acc_1_second_timer);
        });
        $("#time-container").on("collapsibleexpand", function () {
            window.acc_1_second_timer_2 = setInterval(function () {
                let d = new Date().toLocaleString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });
                document.getElementById('time-to-set').innerHTML = d;
            }, 1000);
        });
        $("#time-container").on("collapsiblecollapse", function () {
            if (window.acc_1_second_timer_2) clearInterval(window.acc_1_second_timer_2);
        });
        document.getElementById('wifi-available').addEventListener('click',
            function (el) { panel.populate_wifi(el) });
        document.getElementById('wifi-connected').addEventListener('click',
            function (el) { panel.populate_wifi(el) });
        document.getElementById("button-send-wificreds").addEventListener('click', async function (e) {
            e.preventDefault();
            let ssid = document.getElementById('ssid').value;
            let passwd = document.getElementById('ssid-pw').value;
            if (
                ssid.length > WIFI_SSID_MAX_LENGTH ||
                passwd.length > WIFI_PASSWD_MAX_LENGTH ||
                ssid.length == 0) {
                $('#wificreds-check-popup').popup().popup('open');
            } else {
                await write_characteristic_wificreds_p(ssid + '+' + passwd);
                document.getElementById('ssid').value = '';
                document.getElementById('ssid-pw').value = '';
                $('#wait-reset-popup').popup().popup('open');
                await write_characteristic_mmode_p('R');
            }
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
    populate_wifi: function (el) {
        if (el.target && el.target.nodeName == 'A') {
            const li_element = event.target.parentNode;
            const ssid = li_element.getAttribute('data-ssid');
            document.getElementById('ssid').value = ssid;
        }
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
    product_type: null,
    temp_unit: null,    // 0: ºF, 1: ºC

    load_device: function () {
        // $("#panel-title").text("spa");
        document.getElementById('canvas').innerHTML = window.frames["spa"];
        document.getElementById('canvas').setAttribute("align", "center");
        panel.link_buttons();
        panel.init_leds();
        panel.init_all();
    }
}