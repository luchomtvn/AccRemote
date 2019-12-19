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
    edit_mask: 0b00010000,
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
    
    if ((screen & sm.edit_mask) > 0)
        sm.ds.editing = true;
    else 
        sm.ds.editing = false;

    return sm.ds;
}

let screen = 0x0;

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