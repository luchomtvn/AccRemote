// global.window = window
// global.$ = require('jquery');
// var $ = require('jquery')(window);

describe('registration info inputs', function () {
    beforeEach(function () {
        alert = sinon.spy();
    });
    it('should alert wrong name', function () {
        // $("#reg-ssid").te() = "MLM";
        // $("#reg-user-e-mail").val() = "lalala@gmail.com"
        // $("#reg-module-name").val() = "holantro"

        registration.submit_registration_info();
        chai.assert.isFalse(alert.calledOnce);
        // $("#code-20-digits").val()
    });
});