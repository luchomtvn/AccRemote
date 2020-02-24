registration = {
    re_ssid: /^\w{0,32}$/,
    re_mail: /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,}$/i,
    re_name: /^[\w-]{4,8}$/,
    re_code: /^[\w]{20}$/,
    registration_info: function () {
        let errors = [];

        if (!registration.re_ssid.test(String($("#ssid").val())))
            errors.push("invalid SSID");
        if (!registration.re_ssid.test(String($("#ssid-pw").val())))
            errors.push("invalid password");
        if (!registration.re_name.test(String($("#device-name").val())))
            errors.push("invalid module name");
        if (!registration.re_mail.test(String($("#e-mail-address").val())))
            errors.push("invalid email");

        if (errors.length != 0) {
            alert(errors.join('\n'));
            return null;
        }
        else{
            console.log("Sending registration info to device");
            return {
                ssid: $("#ssid").val(),
                ssid_pw: $("#ssid-pw").val(),
                device_name: $("#device-name").val(),
                email: $("#e-mail-address").val()
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
            this.register_new_device("privateurl", $("#module-name").val(), "spa");
            // configuration.refresh_device_list();
        }
    }
}