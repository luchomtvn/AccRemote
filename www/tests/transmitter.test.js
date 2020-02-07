// global.window = window
// global.$ = require('jquery');
// var $ = require('jquery')(window);

describe('Parse temp tests', function () {
    // beforeEach(function () {
    //     alert = sinon.spy();
    // });
    it('parse temp 23.4C', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "23.4",
            unit: "C"
        }).join(), ['04', 23, '08'].join())
    });
    it('parse temp 7.6C', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "7.6",
            unit: "C"
        }).join(), ['06','07','08'].join())
    });
    it('parse temp 40.0C', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "40.0",
            unit: "C"
        }).join(), ['00',40,'08'])
    });
    it('parse temp 25F', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "25",
            unit: "F"
        }).join(), ['05','02','09'])
    });
    it('parse temp 6F', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "6",
            unit: "F"
        }).join(), ['06','00','09'])
    });
    it('parse temp 104F', function () {
        chai.assert.equal(transmitter.parse_temp({
            val: "104",
            unit: "F"
        }).join(), ['04',10,'09'])
    });
});

describe('Parse time tests', function () {
    it('parse time 10:33 AM', function () {
        chai.assert.equal(transmitter.parse_time({
            hour: "10",
            minute: "33",
            ampm: "am"
        }).join(), ['33', '10', 0x0C].join())
    });
    it('parse time 4:10 PM', function () {
        chai.assert.equal(transmitter.parse_time({
            hour: "4",
            minute: "10",
            ampm: "pm"
        }).join(), ['10', '04', 0x0E].join())
    });
    it('parse time 00:00 AM', function () {
        chai.assert.equal(transmitter.parse_time({
            hour: "00",
            minute: "00",
            ampm: "am"
        }).join(), ['00', '12', 0x0C].join())
    });
});


describe('Parse key tests', function () {
    it('parse key s0', function () {
        chai.assert.equal(transmitter.parse_key({key:"s0"}).join(), [19,0,0].join());
    }); 
    it('parse key x0', function () {
        chai.assert.equal(transmitter.parse_key({key:"x0"}).join(), [18,0,0].join());
    }); 
    it('parse key j0', function () {
        chai.assert.equal(transmitter.parse_key({key:"j0"}).join(), [5,0,0].join());
    }); 
    it('parse key a0', function () {
        chai.assert.equal(transmitter.parse_key({key:"a0"}).join(), [4,0,0].join());
    }); 
    it('parse key l0', function () {
        chai.assert.equal(transmitter.parse_key({key:"l0"}).join(), [17,0,0].join());
    }); 
});
