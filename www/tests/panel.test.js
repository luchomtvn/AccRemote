var SERVICE_UUID             = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";

var test_ci = new Dry();

describe('Tests', function () {
    test_but = new Button("test1", "A0", test_ci);
    describe('Button instantiation', function () {
        it('should create an unsynched button', function () {
            expect(test_but.on_style).to.equal("");
            expect(test_but.jquery_obj).to.equal("");
        });
    });
    test_but2 = new Button("test2", "A0", test_ci);
    describe('Button link to html objects', function () {
        expected_selector = "button-test2-frame";
        test_but2.get_selector(`button-${test_but2.name}-frame`);
        it(`Should bind to object ${expected_selector}`, function() {
            chai.assert(test_but2.jquery_obj.is($(`#${expected_selector}`)));
        });
    });
    describe('Connection Dry run tests', function() {
        scanner = new BluetoothScanner(undefined, true);
        scanner.startScan();
        it(`Should have scanned a dry_run device`, function() {
            chai.assert(scanner.devices[0].name === "AccDryDevice")
            chai.assert(scanner.devices[0].id === "dry_device_id")
        });
        it(`Should find the device in scanner devices array with get_id`, function() {
            chai.assert(scanner.get_id("AccDryDevice") === "dry_device_id");
        });
    });
    describe('Device Bluetooth creation', function () {
        device_bt = new DeviceBluetooth(SERVICE_UUID , CHARACTERISTIC_UUID_READ, true);
        it(`Should be disconnected upon creation`, function () {
            chai.assert.isFalse(device_bt.connected);
        });
        it(`Should be connected to dry_run`, function () {
            device_bt.connect(scanner.devices[0].id);
            chai.assert.isTrue(device_bt.connected);
            chai.assert(device_bt.connected_id === scanner.devices[0].id);
        });
    });
    describe('User registration', function() {
        registration                         = new Registration(test_ci, scanner.devices[0].name)
        connect_new_device                   = new ConnectNewDevice(scanner, device_bt, registration, true);
        it(`should be ready to register a new device`, function() {
            connect_new_device.device_to_connect = scanner.devices[0].name;
            connect_new_device.connect();
            chai.assert(registration.device_name === scanner.devices[0].name);
        })

        it(`should not register given that password was not entered`, function() {
            registration.ssid     = "MLM";
            registration.email    = "lucianomanto@gmail.com";
            expect(registration.register()).to.equal(-1);
            expect(registration.reg_data).to.eql({});
        });   
        it(`should not register given that email confirmation is not right`, function () {
            registration.ssid_pass  = "12365390aa";
            registration.email_conf = "lucianomantooo@gmail.com";
            expect(registration.register()).to.equal(-2);
            expect(registration.reg_data).to.eql({});
        });   
        it(`should register data`, function () {
            registration.email_conf = "lucianomanto@gmail.com";
            expect(registration.register()).to.equal(0);
            expect(registration.reg_data).to.eql({
                    "ssid"      : "MLM",
                    "ssid_pass" : "12365390aa",
                    "email"     : "lucianomanto@gmail.com",
                    "email_conf": "lucianomanto@gmail.com"
            });
        });
    });
    describe('Adding usable device', function() {
        
    });
});
