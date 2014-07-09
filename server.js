var request = require('request-json');
var async = require('async');
var logentries = require('node-logentries');

var client = request.newClient('http://klimasense.com:3001');
var spawn = require('child_process').spawn;

//var peripheralUuid = process.argv[2];

var peripherals = {};
var unconnected = {};


var log = logentries.logger({
  token:'cc436528-4be5-4bc5-8230-4835e6268dd3'
});

log.info('App starting');

var child = spawn(
    '/usr/bin/bluetooth_start.sh',
    []
    );

child.stdout.on('data', function (data) {
  log.info('stdout: ' + data);
});

child.stderr.on('data', function (data) {
  log.error('stderr: ' + data);
});

child.on('close', function (code) {
  log.info('child process exited with code ' + code);

});


var noble = require('noble');
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(["180d"], false);
  } else {
    noble.stopScanning();
  }
});

setInterval(function(){
  noble.startScanning(["180d"], false);
  var keys = Object.keys(unconnected);
  if(keys.length > 0) {
    explore(unconnected[keys[0]]);
  }
}, 4000);

noble.on('discover', function(peripheral) {
    if(peripherals[peripheral.uuid]) {
      log.info(peripheral.advertisement.localName + ' already connected.');

    } else {
      //peripherals[peripheral.uuid] = peripheral;
      unconnected[peripheral.uuid] = peripheral;
  //if (peripheral.uuid === peripheralUuid) {
    //noble.stopScanning();

    log.info('peripheral with UUID ' + peripheral.uuid + ' found');
    var advertisement = peripheral.advertisement;

    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    var serviceData = advertisement.serviceData;
    var serviceUuids = advertisement.serviceUuids;

    if (localName) {
      log.info('  Local Name        = ' + localName);
    }

    if (txPowerLevel) {
      log.info('  TX Power Level    = ' + txPowerLevel);
    }

    if (manufacturerData) {
      log.info('  Manufacturer Data = ' + manufacturerData.toString('hex'));
    }

    if (serviceData) {
      log.info('  Service Data      = ' + serviceData);
    }

    if (localName) {
      log.info('  Service UUIDs     = ' + serviceUuids);
    }

    log.info();

    //explore(peripheral);
  }
  //}
});

function explore(peripheral) {
  try {
  log.info('services and characteristics:');
  delete unconnected[peripheral.uuid];
  peripheral.on('disconnect', function() {
    log.info(peripheral.advertisement.localName + ' has disconnected.');
    try {
    delete peripherals[peripheral.uuid];
    peripheral.removeAllListeners('disconnect');
    } catch (e) {
      log.info(e);
    }
    //unconnected[peripheral.uuid] = peripheral;
    //noble.startScanning(["180d"], false);
    //peripheral.on('disconnect');
    //process.exit(0);
  });

  peripheral.connect(function(error) {
    peripherals[peripheral.uuid] = peripheral;
    peripheral.discoverServices([], function(error, services) {
      //log.info(services);
      var serviceIndex = 0;
      services.forEach(function(_service) {
        //log.info(_service);
        //log.info(_service['uuid']);
        if (_service.uuid == '180d') {
          _service.discoverCharacteristics(["2a37"], function(error, characteristics) {
            var characteristic = characteristics[0];
            characteristic.on('read', function(value, isNotification) {
              //log.info(value);
              log.info(value.readInt16LE(6)/10.0);
              log.info(value.readInt16LE(8)/10.0);
              var data = {
                devicekey: peripheral.uuid,
                devicename: peripheral.advertisement.localName,
                humidity: value.readInt16LE(8)/10.0,
                temperature: value.readInt16LE(6)/10.0,
    ext_temperature: value.readInt16LE(10)/10.0,
    current: value.readInt16LE(12),
    gas: value.readInt16LE(14)
              }
              client.post('graphs/', data, function (err, res, body) {
                if(err) {
                  log.info(err);
                } else {
                //log.info(err);
                //log.info(res);
                //log.info(body);
                  return log.info(res.statusCode);
                }
              })
            });
            setTimeout(function(){
              characteristic.notify(true, function(error){
              log.info("notification enabled");
              log.info(error);
            }, 100);
            })
            log.info(characteristics[0].name);
          });
          //log.info(_service);
        }
      });
    });
  });
  } catch (e) {
    log.info(e);
  }
}