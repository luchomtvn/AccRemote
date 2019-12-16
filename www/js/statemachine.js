let states =  {
    SM_IDLE: 0,
    SM_WAITING_INITIAL_SCREEN: 1,
    SM_WAITING_EDIT_SCREEN: 2,
    SM_WAITING_FINAL_SCREEN: 3
};

let timeouts = {
    TIMETOUT_INITIAL_SCREEN: 5000,
    TIMETOUT_EDIT_SCREEN: 5000,
    TIMETOUT_FINAL_SCREEN: 5000
};

let sm ={
   state : 0,
   timeout: {
       edit_screen : function () {
           setTimeout(() => {
               sm.state = states.SM_IDLE
           }, timeouts.TIMETOUT_EDIT_SCREEN)
       }
   }
}

function sm_run(sm) {
    switch (sm.state){
        case states.SM_IDLE:
            console.log("state: SM_IDLE");
            sm.state = states.SM_WAITING_INITIAL_SCREEN;
            break;
        case states.SM_WAITING_INITIAL_SCREEN:
            console.log("state: SM_WAITING_EDIT_SCREEN");
            sm.state = states.SM_WAITING_EDIT_SCREEN;
            break;
        case states.SM_WAITING_EDIT_SCREEN:
            tout = setTimeout(() => {
                sm.state = states.SM_IDLE;
            }, TIMEOUT_EDIT_SCREEN);
        default:
            break;
    }
}