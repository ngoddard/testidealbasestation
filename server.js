var request = require('request-json');
var async = require('async');
var logentries = require('node-logentries');

var client = request.newClient('http://klimasense.com:3001');

var serialport = require("serialport")
var SerialPort = serialport.SerialPort
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 38400,
  parser: serialport.parsers.readline("\n")
});


var log = logentries.logger({
  token:'cc436528-4be5-4bc5-8230-4835e6268dd3'
});

log.info('App starting');


setInterval(function(){
  log.info('alive2');
}, 4000);

process.on('uncaughtException', function(err) {
    // handle the error safely
    log.err('uncaughtException: ' + err);
    var killtimer = setTimeout(function() {
          process.exit(1);
        }, 3000);
    // But don't keep the process open just for that!
    killtimer.unref();
});

serialPort.on("open", function () {
  log.info('open');
  serialPort.on('data', function(data) {
    log.info('data received: ' + data);
  });
});

serialPort.on("error", function (_error) {
  log.err("Serial Port error: " + _error)
})


/*
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

*/