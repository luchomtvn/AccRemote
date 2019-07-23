var navigation = {
    listed_devices: {
        available_systems    : "available-systems",
        button_add_new_device: "button-add-new-device"
    },
    connection_page: {
        scan_loader_animation   : "scan-loader-animation",
        button_start_stop_scan  : "button-start-stop-scan",
        scan_result_list        : "scan-result-list",
        button_connect_to_device: "button-connect-to-device"
    },
    registration_page: {
        page_id               : "registration-page",
        ssid                  : "ssid",
        ssid_pw               : "ssid-pw",
        email_address         : "email-address",
        email_address_confirm : "email-address_confirm",
        submit_register_button: "submit-register-button"
    }
}

// ListedDevices = PClass.create({
//     init: function () {
//         this.available_sistems     = $("#" + navigation.start_page.available_systems);
//         this.button_add_new_device = $("#" + navigation.start_page.button_add_new_device);
//         this.button_class          = "device-button";
//         this.added_devices         = [];

//         $("." + this.button_class).on('click', function(){
//             let button_name = this.innerHTML;
//         });
//     },
//     add_device: function (name) {
//         this.available_sistems.prepend(`<a data-position-to="window" class= "${this.button_class} device ui-mini ui-btn ui-btn-inline" \
//                                     data-transition="pop">${name}</a>`);
//         this.added_devices.push(name);
//     }

// });

ConnectNewDevice = PClass.create({
    init: function (bluetooth_scanner, bluetooth_device, registration, dry_run) {
        this.bluetooth_scanner = bluetooth_scanner;
        this.bluetooth_device  = bluetooth_device;
        this.registration      = registration;
        this.dry_run           = dry_run;
        // this.object_id = $(`#${object_id}`);

        this.scan_result_list      = $("#" + navigation.connection_page.scan_result_list);
        this.scan_button           = $("#" + navigation.connection_page.button_start_stop_scan);
        this.scan_loader_animation = $("#" + navigation.connection_page.scan_loader_animation);
        this.connect_button        = $("#" + navigation.connection_page.button_connect_to_device);

        this.scan_loader_animation.hide();
        this.device_to_connect = "";
        this.scanning = false;
        let self = this;

        this.scan_button.on('click', function () {
            if (self.scanning === false) {
                self.scan_loader_animation.show();
                self.scanning = true;
                self.bluetooth_scanner.startScan(self.scan_result_list);
            }
            else {
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
            self.connect();
        });
    },
    connect: function() {
        if (!this.dry_run){
            this.bluetooth_device.connect(this.bluetooth_scanner.get_id(this.device_to_connect));
            $.mobile.changePage(this.registration.page_id, { transition: "slidedown", changeHash: false });
        }
        this.registration.device_name = this.device_to_connect;
    }
})

Registration = PClass.create({
    init: function (connection_interface, device_name) {
        this.connection_interface = connection_interface;
        this.device_name          = "";
        this.page_id              = "#" + navigation.registration_page.page_id;
        this.submit_button        = $("#" + navigation.registration_page.submit_register_button);
        this.ssid                 = ""; //$("#" + navigation.registration_page.ssid);
        this.ssid_pass            = ""; //$("#" + navigation.registration_page.ssid_pw);
        this.email                = ""; //$("#" + navigation.registration_page.email_address);
        this.email_conf           = ""; //$("#" + navigation.registration_page.email_address_confirm);
        this.reg_data             = {};
        
        let self = this;

        this.submit_button.on('click', function () {
            self.register();
        });
    },
    register: function () {
        if (!this.ssid || !this.ssid_pass || !this.email || !this.email_conf)
            // alert("Please fill in all the fields");
            return -1;
        else if (this.email !== this.email_conf)
            // alert("E-mails do not match");
            return -2;
        else {
            // alert("Sending data to server");
            this.reg_data = {
                "ssid"      : this.ssid,
                "ssid_pass" : this.ssid_pass,
                "email"     : this.email,
                "email_conf": this.email_conf,
            }
            this.connection_interface.sendMessage(JSON.stringify(this.reg_data));
           // $.mobile.changePage("#start-page", { transition: "slidedown", changeHash: false });
            // alert("Device registered!");
            $("#available-systems").prepend(`<a data-position-to="window" \
                class= "device ui-mini ui-btn ui-btn-inline" \
                data-transition="pop" > ${self.device_name} </a >`);
            return 0;
        }
    }
});

// var available_systems = new AvailableSystems(index_ids.available_systems);
var connection = new Dry(); // for testing until tests are done
var registration = new Registration(connection);
var spaBluetoothConnection = new DeviceBluetooth(SERVICE_UUID, CHARACTERISTIC_UUID_READ, true);
var scanner = new BluetoothScanner(true);
var connect_window = new ConnectNewDevice(scanner, spaBluetoothConnection, registration.page_id);

window.onload = function () {



    document.getElementById('canvas').innerHTML = window.frames["spa"];
    // $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });


    var button_system  = new Button("system", "s0", connection);
    var button_light   = new Button("light", "l0", connection);
    var slider_session = new Slider("session", 10, MAX_SESSION, MIN_SESSION, connection);
    var slider_temp    = new SliderTemp("temp",
                                        50,
                                        MAX_TEMP_FAR_SPA,
                                        MIN_TEMP_FAR_SPA,
                                        MAX_TEMP_CEL_SPA,
                                        MIN_TEMP_CEL_SPA,
                                        connection,
                                        $("#flip-scale"));
    slider_session.set_change_function();
    slider_temp.set_change_function();

    new TimeZoneSelector("time-zone-selector", "form-timezones", "submit-time-zone", connection);

    $(document).on('click', ".device", function () {
        $.mobile.changePage("#control-page", { transition: "slidedown", changeHash: false });
        setScreen("spa");
    });


}