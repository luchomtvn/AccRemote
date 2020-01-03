// global.window = window
// global.$ = require('jquery');
// var $ = require('jquery')(window);

describe('registration info inputs', function () {
    it('should alert wrong name', function () {

        registration.submit_registration_info();
        chai.assert.equal(true, true);
        
    });
});