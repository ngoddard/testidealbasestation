var request = require('request-json');
var async = require('async');
var noble = require('noble');

var client = request.newClient('http://klimasense.com:3001');
var spawn = require('child_process').spawn;
var out = fs.openSync('./out.log', 'a');
var err = fs.openSync('./out_err.log', 'a');

//var peripheralUuid = process.argv[2];

var peripherals = {};
var unconnected = {};


var child = spawn(
    '/usr/bin/bluetooth_start.sh',
    [],
    {
        detached: true,
        stdio: [ 'ignore', out, err ]
    }
    );
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
      console.log(peripheral.advertisement.localName + ' already connected.');

    } else {
      //peripherals[peripheral.uuid] = peripheral;
      unconnected[peripheral.uuid] = peripheral;
  //if (peripheral.uuid === peripheralUuid) {
    //noble.stopScanning();

    console.log('peripheral with UUID ' + peripheral.uuid + ' found');
    var advertisement = peripheral.advertisement;

    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    var serviceData = advertisement.serviceData;
    var serviceUuids = advertisement.serviceUuids;

    if (localName) {
      console.log('  Local Name        = ' + localName);
    }

    if (txPowerLevel) {
      console.log('  TX Power Level    = ' + txPowerLevel);
    }

    if (manufacturerData) {
      console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
    }

    if (serviceData) {
      console.log('  Service Data      = ' + serviceData);
    }

    if (localName) {
      console.log('  Service UUIDs     = ' + serviceUuids);
    }

    console.log();

    //explore(peripheral);
  }
  //}
});

function explore(peripheral) {
  try {
  console.log('services and characteristics:');
  delete unconnected[peripheral.uuid];
  peripheral.on('disconnect', function() {
    console.log(peripheral.advertisement.localName + ' has disconnected.');
    try {
    delete peripherals[peripheral.uuid];
    peripheral.removeAllListeners('disconnect');
    } catch (e) {
      console.log(e);
    }
    //unconnected[peripheral.uuid] = peripheral;
    //noble.startScanning(["180d"], false);
    //peripheral.on('disconnect');
    //process.exit(0);
  });

  peripheral.connect(function(error) {
    peripherals[peripheral.uuid] = peripheral;
    peripheral.discoverServices([], function(error, services) {
      //console.log(services);
      var serviceIndex = 0;
      services.forEach(function(_service) {
        //console.log(_service);
        //console.log(_service['uuid']);
        if (_service.uuid == '180d') {
          _service.discoverCharacteristics(["2a37"], function(error, characteristics) {
            var characteristic = characteristics[0];
            characteristic.on('read', function(value, isNotification) {
              //console.log(value);
              console.log(value.readInt16LE(6)/10.0);
              console.log(value.readInt16LE(8)/10.0);
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
                  console.log(err);
                } else {
                //console.log(err);
                //console.log(res);
                //console.log(body);
                  return console.log(res.statusCode);
                }
              })
            });
            setTimeout(function(){
              characteristic.notify(true, function(error){
              console.log("notification enabled");
              console.log(error);
            }, 100);
            })
            console.log(characteristics[0].name);
          });
          //console.log(_service);
        }
      });
    });
  });
  } catch (e) {
    console.log(e);
  }
}
