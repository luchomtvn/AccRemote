// this file contains all objects that have a special use inside js functions. In order to avoid sudden changes, they are all
// summoned from this file. This is an attempt to have an organized way to keep "global" jquery objects, which aren't that global
// it's just that they're used in js as in html and this is a neat way to keep track of that... 

// sections is the name of the json with all the global variables. then each subsection corresponds to the page where the 
// object will be located inside index.html

// var navigation = {
//     start_page : {
//         available_systems: "available-systems",
//         button_add_new_device: "button-add-new-device"
//     },
//     connection_page : {
//         scan_loader_animation: "scan-loader-animation",
//         button_start_stop_scan: "button-start-stop-scan",
//         scan_result_list: "scan-result-list",
//         button_connect_to_device: "button-connect-to-device"
//     },
//     registration_page: {
//         ssid: "ssid",
//         ssid_pw: "ssid-pw",
//         email_address: "email-address",
//         email_address_confirm: "email-address_confirm",
//         submit_register_button: "submit-register-button"
//     }
// }