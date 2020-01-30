registration = {
    re_ssid: /^\w{0,32}$/,
    re_mail: /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,}$/i,
    re_name: /^[\w-]{4,20}$/,
    re_code: /^[\w]{20}$/,
    submit_registration_info: function () {
        let errors = [];

        if (!registration.re_ssid.test(String($("#reg-ssid").val())))
            errors.push("invalid ssid");

        // if (!registration.re_mail.test(String($("#reg-user-e-mail").val()).toLowerCase()))
            // errors.push("invalid e-mail");

        if (!registration.re_name.test(String($("#reg-module-name").val())))
            errors.push("invalid module name (4 to 20 characters long)");

        registered_devices.forEach(element => {
            if (this.name == $("#reg-module-name").val()) {
                errors.push("invalid module name (name already registered)");
            }
        });

        if (errors.length != 0) {
            alert(errors.join('\n'));
        }
        else {
            user = session.getInstance().get();
            if (user == undefined)
                $.mobile.changePage("#login-page", { transition: "slidedown", changeHash: false });
            else{
                user.devices.push({
                    name: $("#reg-module-name").val(),
                    privateurl: "url"
                });
                alert("sent data to module");

            }
        }
    },
    submit_20_digit_code: function () {
        if (!registration.re_code.test($("#code-20-digits").val())) {
            alert("invalid code");
        }
        else {
            alert("sent data to server");
            // POST to server with 20 digits. 
            // answer to POST will be url of device.
            this.register_new_device("privateurl", $("#reg-module-name").val(), "spa");
            configuration.refresh_device_list();
        }
    },
    register_new_device: function(privateurl, modulename, type) {
        database.addDevice(privateurl, modulename, type);
        configuration.refresh_device_list();
    }
}

registered_devices = [{ // todo: should get this info from app memory
    name: "spa suite",
    type: "spa",
    module_bt_name: "AccModule",
    module_ssid: "MLM",
    module_pass: "12365390aa",
    user_email: "lucianomanto@gmail.com"
}, {
    name: "sauna pool",
    type: "sauna",
    module_bt_name: "AccModule",
    module_ssid: "MLM",
    module_pass: "12365390aa",
    user_email: "lucianomanto@gmail.com"
}];

current_device = registered_devices[0]; // todo: should get this info from app memory
