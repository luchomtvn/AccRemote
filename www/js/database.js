
var database = {
    db :null,
    nullArgCB: function () {
        console.log("transaction returned null argument");
    },
    transactionErrorCB: function () {
        console.log("transaction returned error");
    },
    executeErrorCB: function () {
        console.log("execute returned error");
    },
    successCB: function () {
        console.log("transaction returned sucessfully");
    },
    openDatabase: function () {
        this.db = window.sqlitePlugin.openDatabase({
            name: '.db',
            location: 'default',
        });
    },
    getUrlByName: function(name) {
        this.db.executeSql('SELECT * from devices where spaname=?', [name],
            function (tx) {
                console.log("Success, rows " + tx.rows.length);
                console.log("device url: " + tx.rows.item(0).privateurl)
            },
            function (e) {
                console.log("Error: " + e)
            });
    },
    createTable: function() {
        this.db.transaction(function(tx){
            tx.executeSql('CREATE TABLE if not exists devices (deviceid integer primary key autoincrement, \
                                    privateurl text, \
                                    spaname text, \
                                    inuse text, \
                                    devtype text, \
                                    CONSTRAINT u_name UNIQUE (spaname))', []);
        },
        function(e){
            console.log(e);
        },
        function(){
            console.log("Success table creation");
        });
    },
    addDevice: function(privateurl, spaname, devtype) {
        this.db.transaction(function(tx){
            tx.executeSql('insert into devices (privateurl, spaname, inuse, devtype) values (?,?,?,?)', 
                [privateurl, spaname, "yes", devtype]);
        },
        function(e){
            console.log(e);
        });
    }
}