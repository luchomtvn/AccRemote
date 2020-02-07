// global.window = window
// global.$ = require('jquery');
// var $ = require('jquery')(window);

describe('registration info inputs', function () {
    beforeEach(function () {
        alert = sinon.spy();
    });
    it('parse temp', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "23.4",
            unit: "C"
        }), "042308")
    });
    it('parse temp', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "7.6",
            unit: "C"
        }), "060708")
    });
    it('parse temp', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "40.0",
            unit: "C"
        }), "004008")
    });
});