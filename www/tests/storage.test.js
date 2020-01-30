describe('Device managment tests', function () {
    beforeEach(function () {
        alert = sinon.spy();
    });
    it('Should add a device to device pool', function () {
        window.configuration.add_device("prueba");
        chai.assert.isTrue(window.localStorage.getItem("devices").split(",").indexOf("prueba"));
    });
});