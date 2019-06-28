var assert = require('assert');
var panel = require('../js/panel.js');
// require('../js/navigation.js');
// import {BluetoothScanner, DeviceBluetooth} from 'navigation';

describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});

describe('f2c', function () {
    it('should convert 40 farenheit to 10.5 celsius', function () {
        assert.equal(panel.f2c(40), 10.5); 
    });
});

describe('startScan', function() {
    it('should not scan if bluetooth isnt available', function () {
        scanner = new panel.BluetoothScanner();
        assert.equal(scanner.startScan(), -1); 
    });
})