var SERVICE_UUID             = "0000181c-0000-1000-8000-00805f9b34fb";
var CHARACTERISTIC_UUID_READ = "00002a6f-0000-1000-8000-00805f9b34fb";

globals.dry_run = true;
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


    describe('Register a new device', function() {
        bt_module = new BluetoothModule(SERVICE_UUID, //service
                                        CHARACTERISTIC_UUID_READ, //characteristic
                                        );
                                        
        it(`Ready to scan`, function() {
            chai.assert(bt_module.readyToScan());
        });
        it(`Should scan and find TEST_DEVICE_1`, function() {
            bt_module.startScan();
            let found = false;
            bt_module.scanner.found_devices.forEach(function(element) {
                if (JSON.stringify(element) === '{"name":"TEST_DEVICE_1","id":"12345"}') {
                    found = true;
                }
            });
            chai.assert(found);
        });
        it(`Should find the device in scanner devices array with get_id`, function() {
            chai.assert(bt_module.get_id("TEST_DEVICE_1") === "12345");
        });
        it(`Should connect to TEST_DEVICE_1`, function () {
            bt_module.connect("TEST_DEVICE_1");    // uses get_id to connect, in real case, parameter is obtained from html
            chai.assert.isTrue(bt_module.connection.status);
            chai.assert(bt_module.connection.id === "12345");
        });

        // ws_module = new DeviceWebSocket("ws://127.0.0.1:5555");
        // it(`Should get registration information from user`, function () {
        //     // connect via ws to server, send data, recieve confirmation.


        // });        
    });


    // describe('this is wrong', function() {
    //     // registration        = new Registration(test_ci, scanner.devices[0].name)
    //     // connect_new_device  = new ConnectNewDevice(scanner, device_bt, registration, true);
    //     bt_module = new BluetoothModule(SERVICE_UUID, //service
    //                                     CHARACTERISTIC_UUID_READ, //characteristic
    //                                     );
    //     it(`should scan for new devices and find one`, function() {

    //         connect_new_device.device_to_connect = scanner.devices[0].name;
    //         connect_new_device.connect();
    //         chai.assert(registration.device_name === scanner.devices[0].name);
    //     })

    //     it(`should not register given that password was not entered`, function() {
    //         registration.ssid     = "MLM";
    //         registration.email    = "lucianomanto@gmail.com";
    //         expect(registration.register()).to.equal(-1);
    //         expect(registration.reg_data).to.eql({});
    //     });   
    //     it(`should not register given that email confirmation is not right`, function () {
    //         registration.ssid_pass  = "12365390aa";
    //         registration.email_conf = "lucianomantooo@gmail.com";
    //         expect(registration.register()).to.equal(-2);
    //         expect(registration.reg_data).to.eql({});
    //     });   
    //     it(`should register data`, function () {
    //         registration.email_conf = "lucianomanto@gmail.com";
    //         expect(registration.register()).to.equal(0);
    //         expect(registration.reg_data).to.eql({
    //                 "ssid"      : "MLM",
    //                 "ssid_pass" : "12365390aa",
    //                 "email"     : "lucianomanto@gmail.com",
    //                 "email_conf": "lucianomanto@gmail.com"
    //         });
    //     });
    // });
    describe('Adding usable device', function() {

    });
});
