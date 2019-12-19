var stash = {
    set_temp : null,
    set_session : null,
    set_timezone : null,
    clear : function() {
        this.set_temp = null;
        this.set_session = null;
        this.set_timezone = null;
    }
};

var states =  {
    SM_IDLE: 0,
    SM_WAITING_INITIAL_SCREEN: 1,
    SM_WAITING_EDIT_SCREEN: 2,
    SM_WAITING_FINAL_SCREEN: 3
};

var timeouts = {
    TIMEOUT_INITIAL_SCREEN: 5000,
    TIMEOUT_EDIT_SCREEN: 5000,
    TIMEOUT_FINAL_SCREEN: 5000
};

var sm = {
    state : 0,
    value : {
        temp : 40,
        session: 10,
        timezone: 10
    },
    timeout: {
        edit_screen : function () {
            return setTimeout(() => {
                sm.state = states.SM_IDLE
            }, timeouts.TIMEOUT_EDIT_SCREEN)
        }
    },
    edit_mask: 0b00100000,
    ds : {
        editing : false,
    }
}

function decode_screen(screen){
    sm.ds = {
        hour: "",
        temperature: 0,
        session: 0,
        unit: "",
        editing: 0,
        inverted: 0
    }

    if (screen.length != 10 && screen.length != 12)
        return "Err:00";

    if (/[^0-9a-fA-F]/.test(screen)) // check for non-hexa chars
        return "Err:01";

    if ((screen[0] + screen[1] == false) && (screen[2] + screen[3] == false) ||
        (screen[2] + screen[3] == false) && (screen[4] + screen[5] == false) ||
        (screen[4] + screen[5] == false) && (screen[6] + screen[7] == false))
        return "Err:02";
    
    if (parseInt(screen[8] + screen[9], 16) & sm.edit_mask)
        sm.ds.editing = 1;

    return sm.ds;
}

function decode_digit(dig_1, dig_2){

    let digit = parseInt(dig_1 + dig_2, 16);

    let table = {
        0b00111111: 0,
        0b00000110: 1,
        0b01011011: 2,
        0b01001111: 3,
        0b01100110: 4,
        0b01101101: 5,
        0b01111101: 6,
        0b00000111: 7,
        0b01111111: 8,
        0b01101111: 9,
        0b00000000: '',
        0b01110001: 'F',
        0b01110110: 'H',
        0b00111000: 'L',
        0b01111001: 'E',
        0b01010000: 'r',
        0b01011100: 'o',
        0b01010100: 'n',
        0b00111001: 'C',
        0b01101101: 'S',
        0b01110011: 'P',
        0b01111000: 't',
        0b01110111: 'A',
        0b01011110: 'd',
        0b00111110: 'U'
    }
    return table[digit];
}

function invert_digit(dig_1, dig_2){
    let digit = parseInt(dig_1 + dig_2, 16).toString(2).split("");
    if(digit.length < 8){
        for (let i = 0; i < 8 - digit.length; i++) // adds 0s to the left
            digit.unshift("0");
    }
    let inverted = [];
    for (let i = digit.length - 1; i >= 0; i--){
        inverted.push(digit[i]);
    }
    let result = parseInt(inverted.join(""), 2).toString(16);

    if(result.length == 1) 
        return "0" + result; // adds a 0 to the left
    else return result;

}

// setInterval(() => {
//     decode_screen()
//     sm_run();
// }, 2000);


// STATE MACHINE is run with every new screen
// it is necesary that decode_screen is ran before triggering the sm (after a new screen arrived)
function sm_run() {

    console.log("current state: " + sm.state);

    switch (sm.state){
        case states.SM_IDLE:
            console.log("state: SM_IDLE");
            if(stash.set_temp != null){
                sm.value.temp = stash.set_temp;
                stash.clear();
                sm.state = states.SM_WAITING_INITIAL_SCREEN;
            }
            else if (stash.set_session != null) {
                sm.value.session = stash.set_session;
                stash.clear();
                sm.state = states.SM_WAITING_INITIAL_SCREEN;
            }
            else if (stash.set_timezone != null) {
                sm.value.timezone = stash.set_timezone;
                stash.clear();
                sm.state = states.SM_WAITING_INITIAL_SCREEN;
            }
            break;
        case states.SM_WAITING_INITIAL_SCREEN:
            console.log("state: SM_WAITING_INITIAL_SCREEN");
            if (!sm.ds.editing){
                sm.state = states.SM_WAITING_EDIT_SCREEN;
            }
            break;
        case states.SM_WAITING_EDIT_SCREEN:
            if(sm.ds.editing)
                sm.state = states.SM_WAITING_FINAL_SCREEN;
            // sm.state = states.SM_WAITING_EDIT_SCREEN;
            break;
        case states.SM_WAITING_FINAL_SCREEN:
            if(!sm.ds.editing){
                sm.state = states.SM_IDLE;
            }
            break;
        default:
            break;
    }
}