describe('State change logic', function () {
    it('should change to waiting_initial when state is idle and there is a new enetered value for temp', function () {
        sm.state = states.SM_IDLE;
        stash.set_temp = 50;
        sm_run();
        chai.assert.equal(sm.state, states.SM_WAITING_INITIAL_SCREEN);
    });
    it('should change to waiting_initial when state is idle and there is a new enetered value for session', function () {
        sm.state = states.SM_IDLE;
        stash.set_session = 50;
        sm_run();
        chai.assert.equal(sm.state, states.SM_WAITING_INITIAL_SCREEN);
    });
    it('should change to waiting_initial when state is idle and there is a new enetered value for timezone', function () {
        sm.state = states.SM_IDLE;
        stash.set_timezone = 50;
        sm_run();
        chai.assert.equal(sm.state, states.SM_WAITING_INITIAL_SCREEN);
    });
    it('should change to waiting_edit when state is waiting_initial and editing is false', function () {
        sm.state = states.SM_WAITING_INITIAL_SCREEN;
        sm.ds = decode_screen("111111100000");
        sm_run();
        chai.assert.equal(sm.state, states.SM_WAITING_EDIT_SCREEN);
    });
    it('should change to waiting_final when state is waiting_edit and editing is true', function () {
        sm.state = states.SM_WAITING_EDIT_SCREEN;
        sm.ds = decode_screen("111111110000");
        sm_run();
        chai.assert.equal(sm.state, states.SM_WAITING_FINAL_SCREEN);
    });
    it('should change to idle when state is waiting_final and editing is false (finished editing)', function () {
        sm.state = states.SM_WAITING_FINAL_SCREEN;
        sm.ds = decode_screen("111111100000");
        sm_run();
        chai.assert.equal(sm.state, states.SM_IDLE);
    });
});


describe('Decode screen logic', function () {
    it('Error 00: should give error when screen is 14 characters long', function () {
        chai.assert.equal(decode_screen("10101010101010"), "Err:00"); // 14 characters
    });
    it('Error 00: should give error when screen is 8 characters long', function () {
        chai.assert.equal(decode_screen("10101010"), "Err:00"); // 8 characters
    });
    it('Error 00: should not give error when screen is 10 characters long', function () {
        chai.assert.notEqual(decode_screen("1010101010"), "Err:00"); // 10 characters
    });
    it('Error 00: should not give error when screen is 12 characters long', function () {
        chai.assert.notEqual(decode_screen("101010101010"), "Err:00"); // 12 characters
    });
    it('Error 01: Should give error when a non-hexadecimal character is present', function () {
        chai.assert.equal(decode_screen("10i0101010"), "Err:01"); 
    });
    it('Error 01: Should not give error when a non-hexadecimal character is not present', function () {
        chai.assert.notEqual(decode_screen("1010abc010"), "Err:01"); 
    });
    it('Error 02: Should give error when digit 1 and 2 are off', function () {
        chai.assert.equal(decode_screen("000011110000"), "Err:02"); 
    });
    it('Error 02: Should give error when digit 2 and 3 are off', function () {
        chai.assert.equal(decode_screen("110000110000"), "Err:02"); 
    });
    it('Error 02: Should give error when digit 3 and 4 are off', function () {
        chai.assert.equal(decode_screen("111100000000"), "Err:02"); 
    });
});
