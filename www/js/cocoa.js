var db = null;

document.addEventListener('deviceready', function () {
    // if (cordova.platformId === "ios") {
    // } else {
    // }
    window.mymcode = undefined;
    NativeStorage.getItem("mymcode",
        function (val) {
            console.log("value for mycode: ", val);
            if (val === undefined) {
                window.mymcode = RandomBase64();
                NativeStorage.setItem("mymcode", window.mymcode,
                    function (val) {
                        console.log("set new mycode ok: ", val);
                    },
                    function (error) {
                        console.log("Fatal error, cannot set mycode: ", error);
                    });
            } else {
                window.mymcode = val;
                console.log("Retrieved mcode value: ", window.mymcode);
            }
        },
        function (error) {
            console.log("get item error: ", error);
        });
});

function RandomBase64() {
    var len = 12; // 12 bytes will be 16 base64 chars
    var binary = '';
    var bytes = new Uint8Array(len);
    window.crypto.getRandomValues(bytes);
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
