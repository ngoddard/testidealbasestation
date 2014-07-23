var request = require('request-json');
var async = require('async');
var logentries = require('node-logentries');
//var Proto  = require("node-protobuf").Protobuf;
//var request = require("request");

//var IdealPB2 = new Proto(fs.readFileSync("ideal.desc"));

var loggly = require('loggly');
 
 var client = loggly.createClient({
    token: "938edd34-64c3-4da1-9635-275eb194beb4",
    subdomain: "ideallog",
    tags: ["NodeJS"],
    json:true
});

client.log("Hello World from Node.js!");

const HomeOffset = 0;
const BaseStationAddress = process.env.RESIN_DEVICE_UUID;


var jsonClient = request.newClient('http://129.215.164.145:3000/');

var serialport = require("serialport")
var SerialPort = serialport.SerialPort
var serialPort = new SerialPort(process.env.IDEAL_SERIAL, {
  baudrate: 38400,
  parser: serialport.parsers.readline("\n")
});


var log = logentries.logger({
  token:process.env.LOGENTRIES_TOKEN
// token:'cc436528-4be5-4bc5-8230-4835e6268dd3'  
});

log.info('App starting');


setInterval(function(){
  //log.info('alive2');
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

function sendProtobuf(data) {
  //log.info(data)
}

function sendJSON(data) {
  // console.log(data);
  jsonClient.post('jsonreading/', data, function (err, res, body) {
      if(err) {
        console.log(err);
      } else {
      //log.info(err);
      //log.info(res);
      //log.info(body);
        return client.log({"statusCode": res.statusCode});
      }
  });
}

serialPort.on("open", function () {
  log.info('open');
  serialPort.on('data', function(data) {
    //log.info('data received: ' + data);
    try {
      js_data = JSON.parse(data);
    } catch (er) {
      return;
    }
    logly_data = {
      "basestation_address": BaseStationAddress,
      "sensorbox_address": js_data.node_id + HomeOffset,
      "timestamp": (Date.now())/100,
      "timeinterval": 60
    }
    out_data = {
      "basestation_address": BaseStationAddress,
      "data_samples": [
        {
          "sensorbox_address": js_data.node_id + HomeOffset,
          "timestamp": (Date.now() - 1262304000000)/100,
          "timeinterval": 60
        }
      ]
    }
    switch(js_data.packet_type) {
      case 1:
        out_data["data_samples"][0]["internal_temperature"] = js_data.val0;
        out_data["data_samples"][0]["humidity"] = js_data.val1;
        logly_data["internal_temperature"] = js_data.val0;
        logly_data["humidity"] = js_data.val1;
        client.log(logly_data);
        sendJSON(logly_data);
        sendProtobuf(out_data);
        break;
      case 2:
        break;
      case 3:
        out_data["data_samples"][0]["current"] = js_data.val0;
        logly_data["current"] = js_data.val0;
        sendProtobuf(out_data);
        client.log(logly_data);
        sendJSON(logly_data);
        break;
      case 4:
        out_data["data_samples"][0]["clamp_temperature1"] = js_data.val0;
        out_data["data_samples"][0]["clamp_temperature2"] = js_data.val1;
        sendProtobuf(out_data);
        logly_data["clamp_temperature1"] = js_data.val0;
        logly_data["clamp_temperature2"] = js_data.val1;
        client.log(logly_data);
        sendJSON(logly_data);
        break;
      case 5:
        out_data["data_samples"][0]["light"] = js_data.val0;
        sendProtobuf(out_data);
        logly_data["light"] = js_data.val0;
        client.log(logly_data);
        sendJSON(logly_data);
        break;
      case 6:
        out_data["data_samples"][0]["gas_pulse"] = js_data.val0;
        logly_data["gas_pulse"] = js_data.val0;
        sendProtobuf(out_data);
        client.log(logly_data);
        sendJSON(logly_data);
        break;
    }
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