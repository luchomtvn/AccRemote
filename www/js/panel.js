let panel = {};

panel.f2c = function (far) {
    var stepval = far - 45;
    stepval = stepval.toFixed(0);
    var hstepval = Math.floor(stepval / 2);
    var cval = stepval % 2 ? 8.1 + hstepval * 1.1 : 7.6 + hstepval * 1.1;
    return cval.toFixed(1);
}

module.exports = panel;