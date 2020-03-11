
document.addEventListener('deviceready', function () {
    // if (cordova.platformId === "ios") {
    // } else {
    // }
    window.mymcode = undefined;
    NativeStorage.keys(
        function (vals) {
            if (vals.includes("mymcode")) {
                NativeStorage.getItem("mymcode", function (res) {
                    window.mymcode = res;
                    console.log("Retrieved mymcode value: ", window.mymcode);
                }, function (error) {
                    console.log("error retrieving mymcode: ", error);
                });
            } else {
                var aux = RandomBase64url();
                NativeStorage.setItem("mymcode", aux,
                    function () {
                        window.mymcode = aux;
                        console.log("set new mycode ok: ", aux);
                    },
                    function (error) {
                        console.log("Fatal error, cannot set mycode: ", error);
                    });
            }
        },
        function (error) {
            console.log("all keys error: ", error);
        });
});

function getAllkeys() {
    NativeStorage.keys(function (obj) {
        console.log('all results: ', obj);
    }, function (error) {
        console.log('error found: ', error);
    })
}

function RandomBase64url() {
    var len = 12; // 12 bytes will be 16 base64 chars
    var result = '';
    var bytes = new Uint8Array(len);
    window.crypto.getRandomValues(bytes);
    for (var i = 0; i < len; i++) {
        result += String.fromCharCode(bytes[i]);
    }
    var res = window.btoa(result);
    res = res.replace(/\+/g, '-');
    res = res.replace(/\//g, '_');
    return res;
}
