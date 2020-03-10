var db = null;

document.addEventListener('deviceready', function () {
    if (cordova.platformId === "ios") {
        db = window.sqlitePlugin.openDatabase({
            name: 'accremote.db',
            // location: 'default',
            iosDatabaseLocation: 'default',
        });
    } else {
        db = window.sqlitePlugin.openDatabase({
            name: 'accremote.db',
            location: 'default',
            androidDatabaseProvider: 'system',
        });
    }
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
    db.transaction(function (tx) {
        var existing_row = undefined;
        tx.executeSql('SELECT mcode from mcodes', [],
            function (tx, rs) {
                existing_mcode = rs.rows.item[0];
            },
            function (tx, error) {
                console.log('SELECT error: ' + error.message);
            });
        if (existing_row === undefined) {
            tx.executeSql('INSERT INTO mcodes VALUES (?)', [mcode],
                function (tx, rs) {
                    console.log('valor mcode: ', mcode);
                },
                function (tx, error) {
                    console.log('INSERT error: ' + error.message);
                });
        } else {
            console.log('mcode row: ', existing_row);
        }
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
