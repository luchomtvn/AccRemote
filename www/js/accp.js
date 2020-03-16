// acc persistent data
/*
important: for IOS and android, add these to lines to config.xml:

<preference name="iosPersistentFileLocation" value="Library" />
<preference name="AndroidPersistentFileLocation" value="Internal" />

*/
accP_errorHandler = function (fileName, e) {
  var msg = ''
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'Storage quota exceeded'
      break
    case FileError.NOT_FOUND_ERR:
      msg = 'File not found'
      break
    case FileError.SECURITY_ERR:
      msg = 'Security error'
      break
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'Invalid modification'
      break
    case FileError.INVALID_STATE_ERR:
      msg = 'Invalid state'
      break
    default:
      msg = 'Unknown error'
      break
  }

  console.log('Error (' + fileName + '): ' + msg)
};

document.addEventListener('deviceready', function () {
  window.requestFileSystem =
    window.requestFileSystem || window.webkitRequestFileSystem
  window.requestFileSystem(
    window.PERSISTENT,
    2 * 1024 * 1024 /*2MB*/,
    function (fs) { console.log('File system opened: ' + fs.name) },
    accP_errorHandler
  );
  accP = {
    readFromFile: function (fileName, cb) {
      var pathToFile = cordova.file.dataDirectory + fileName
      window.resolveLocalFileSystemURL(
        pathToFile,
        function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader()
            reader.onloadend = function (e) {
              cb(JSON.parse(this.result))
            }
            reader.readAsText(file)
          }, function () {
            console.log('paso por aca con filename: ', fileName);
            accP_errorHandler.bind(null, fileName)
          })
        }, function (e) {
          if (e.code === FileError.NOT_FOUND_ERR) cb(null);
          else accP_errorHandler(fileName, e);
        }
      )
    },
    writeToFile: function (fileName, data) {
      data = JSON.stringify(data, null, '\t')
      window.resolveLocalFileSystemURL(
        cordova.file.dataDirectory,
        function (directoryEntry) {
          directoryEntry.getFile(
            fileName,
            { create: true },
            function (fileEntry) {
              fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                  console.log('Write of file "' + fileName + '"" completed.')
                }
                fileWriter.onerror = function (e) {
                  console.log('Write failed: ' + e.toString())
                }
                var blob = new Blob([data], { type: 'text/plain' })
                fileWriter.write(blob)
              }, accP_errorHandler.bind(null, fileName))
            },
            accP_errorHandler.bind(null, fileName)
          )
        },
        accP_errorHandler.bind(null, fileName)
      )
    },
  };
  window.acc_mcode = null;
  window.known_local_devices = null;
  window.known_remote_devices = null;
  window.connected_device = null;
  accP.readFromFile('mmcode.json', function (data) {
    if (data) window.acc_mcode = data;
    else {
      window.acc_mcode = RandomBase64url();
      accP.writeToFile('mmcode.json', window.acc_mcode);
    }
  });
  accP.readFromFile('known_local_devices.json', function (data) {
    if (data) window.known_local_devices = data;
  });
  accP.readFromFile('known_remote_devices.json', function (data) {
    if (data) window.known_remote_devices = data;
  });
  accP.readFromFile('connected_device.json', function (data) {
    if (data) window.connected_device = data;
  });
}, false);

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

function save_known_local_devices() {
  accP.writeToFile('known_local_devices.json', window.known_local_devices);
}

function save_known_remote_devices() {
  accP.writeToFile('known_remote_devices.json', window.known_remote_devices);
}

function save_connected_device() {
  accP.writeToFile('connected_device.json', window.connected_device);
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}
