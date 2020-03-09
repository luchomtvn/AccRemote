var db = null;

document.addEventListener('deviceready', function () {
    db = window.sqlitePlugin.openDatabase({
        name: 'accremote.db',
        location: 'default',
        androidDatabaseProvider: 'system',
    });
    db.transaction(function (tx) {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS devices (
                id PRIMARY KEY,
                name TEXT,
                btid TEXT UNIQUE,
                wifimac text
        )`);
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS selected (
                id PRIMARY KEY,
                device_id TEXT,
                FOREIGN KEY (device_id) REFERENCES devices(id)
        )`);
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS mcodes (
                id PRIMARY KEY,
                mcode TEXT,
                tstamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Populated database OK');
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
