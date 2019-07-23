var MAX_TEMP_FAR_SAUNA = 160;
var MIN_TEMP_FAR_SAUNA = 50;
var MAX_TEMP_CEL_SAUNA = 70.8;
var MIN_TEMP_CEL_SAUNA = 10.3;
var MAX_TEMP_FAR_SPA   = 104;
var MIN_TEMP_FAR_SPA   = 45;
var MAX_TEMP_CEL_SPA   = 40;
var MIN_TEMP_CEL_SPA   = 7.6;
var MAX_SESSION        = 60;
var MIN_SESSION        = 10;
var accDevicesIds      = {};

ControlElement = PClass.create({
    init: function (name, value, connection_interface) {
        this.name                 = name;
        this.value                = value;
        this.connection_interface = connection_interface;
        this.jquery_obj           = "";
    },
    get_selector: function (svg) {
        throw new Error("Must be implemented");
    }
});

Button = ControlElement.extend({
    init: function (name, value, connection_interface) {
        this._super(name, value, connection_interface);
        this.on_style = "";
        this.jquery_obj = "";
        // if (this.get_selector()) {
        //     console.log("button " + this.name + " linked to panel");
        //     this.on_style = this.jquery_obj.attr("style");
        //     this.style_frame();
        //     this.click_event();
        // }
        // else
        // console.log("created button without graphic bind, clicking will have no effect");
    },
    get_selector: function (selector_str) {
            this.jquery_obj = $('#' + selector_str);
    },
    click_event: function () {
        let self = this;
        this.jquery_obj.on("click", function () { // inside the function, 'this' is the jquery object that was clicked
            var bdata = $(this).data("b");
            var tout = bdata == 6 ? 1000 : 1000;
            $(this).attr("style", $(this).data("int"));
            self.connection_interface.sendMessage(self.value);
            var mytimer = setTimeout(function () {
                let res = self.reset_button();
                if (res == -1) { console.log("couldn't reset frame"); }
            }, tout);
            $(this).data("timer", mytimer);
        });
    },
    style_frame: function () {
        let off_style = this.on_style.replace(/stroke-opacity[^;]*;?/, "");
        if (off_style.length > 0) { off_style += ';' };
        off_style += 'stroke-opacity:0;fill-opacity:0;fill:#00ffff';
        this.jquery_obj.attr("style", off_style);
        this.jquery_obj.data("b", 0);
        this.jquery_obj.data("off", off_style);
        this.jquery_obj.data("int", off_style + 'stroke-opacity:0;fill-opacity:0.2;fill:#ffffff');
        this.jquery_obj.data("timer", '');
        return 0;
    },
    reset_button: function () {
        if (this.jquery_obj == undefined) return -1; // unused button
        if (this.jquery_obj.attr("style", this.jquery_obj.data("off")) == undefined) return -1; // unused button
        this.jquery_obj.attr("style", this.jquery_obj.data("off"))
        var mytimer = this.jquery_obj.data("timer");
        if (mytimer !== '') {
            clearTimeout(mytimer);
            this.jquery_obj.data("timer", '');
        }
        return 0;
    }

});


Slider = ControlElement.extend({
    init: function (name, start_value, max, min, connection_interface) {
        this._super(name, 0, connection_interface);
        this.max               = max;
        this.min               = min;
        this.start_value       = start_value;
        this.jquery_obj        = $("#slider-" + this.name);
        this.jquery_obj_2      = $("#slider-2-" + this.name);
        this.jquery_obj_submit = $("#submit-" + this.name);

        if (this.jquery_obj != undefined && this.jquery_obj_2 != undefined && this.jquery_obj_submit != undefined) {
            console.log("slider " + this.name + " linked to panel")
            this.jquery_obj.attr("min", this.min);
            this.jquery_obj.attr("max", this.max);
            let self = this;
            this.onChange = function () {
                self.jquery_obj.val(this.value);
            }
            this.jquery_obj_submit.click(function () {
                self.connection_interface.sendMessage(self.jquery_obj.val());
            });
        }
        else { console.log("slider " + this.name + " unlinked"); }
    },
    submit: function () {
        this.connection_interface.sendMessage(this.jquery_obj.val());
    },
    set_change_function: function () {
        this.jquery_obj.change(this.onChange).change();
    }
});

SliderTemp = Slider.extend({
    init: function (name, start_value, maxF, minF, maxC, minC, connection_interface, flip_scale) {
        this._super(name, start_value, maxF, minF, connection_interface);
        this.minF         = minF;
        this.maxF         = maxF;
        this.minC         = minC;
        this.maxC         = maxC;
        this.flip_scale   = flip_scale;
        this.slider_label = $("#slider-label");
        let self          = this;
        this.flip_scale.on("change", function () {
            var scale = this.value;
            var textslider = '';
            if (scale == 0) {
                textslider = 'Slider (°F):';
                self.jquery_obj.attr("min", self.minF).attr("max", self.maxF).attr("step", 1).val(self.jquery_obj_2.val());
            }
            else {
                textslider = 'Slider (°C):';
                var cval = f2c(self.jquery_obj_2.val());
                self.jquery_obj.attr("min", self.minC).attr("max", self.maxC).attr("step", .1).val(cval);
            }
            self.slider_label.text(textslider);
        });
        this.flip_scale.change();
        this.onChange = function () {
            var oldvalue = self.jquery_obj.attr("value");
            if (self.flip_scale.val() == 1) {
                var number = parseFloat(this.value);
                if (!(number <= self.maxC && number >= self.minC)) number = f2c(parseFloat(oldvalue));
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
                self.jquery_obj_2.val(far.toFixed(0));
            }
            else {
                if (!(this.value <= self.maxF && this.value >= self.minF)) this.value = oldvalue;
                self.jquery_obj_2.val(this.value);
            }
        }
    }
});

function f2c(far) {
    var stepval  = far - 45;
        stepval  = stepval.toFixed(0);
    var hstepval = Math.floor(stepval / 2);
    var cval     = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
    return cval.toFixed(1);
}

LedNotification = PClass.create({
    init: function (name) {
        this.name   = name;
        this.status = false;
    },
    toggle : function () { this.status = this.status ? false : true; },
    turnOn : function () { this.status = true; },
    turnOff: function () { this.status = false; }
});

TimeZoneSelector = PClass.create({
    init: function (name, form_class, submit, connection_interface) {
        this.name                 = name;
        this.connection_interface = connection_interface;
        this.jquery_obj           = $("#" + this.name)
        this.form_class           = $("." + form_class);
        this.submit               = $("#" + submit);
        let self                  = this;

        if (this.submit != undefined && this.form_class != undefined && this.jquery_obj != undefined) {
            this.submit.click(function () {
                self.connection_interface.sendMessage(self.jquery_obj.val());
            });
            this.form_class.timezones();
        }
    }

});

exports = {
    ControlElement,
    Button,
    Slider,
    SliderTemp,
    TimeZoneSelector,
    LedNotification
};