var request = require('request-json');
var async = require('async');

var loggly = require('loggly');
var Enum = require('enum');

var packetType = new Enum({'TEMPHUM': 1,
                           'BROADCAST': 2,
                           'CURRENT': 3,
                           'CLAMPS': 4,
                           'LIGHT': 5,
                           'GAS': 6 });

 var client = loggly.createClient({
    token: "938edd34-64c3-4da1-9635-275eb194beb4",
    subdomain: "ideallog",
    tags: ["NodeJS"],
    json:true
});

client.log("Starting app");

const HomeOffset = 0;
const BaseStationAddress = process.env.RESIN_DEVICE_UUID;

var IDEALJSONClient = request.newClient(process.env.IDEAL_SERVER);

var serialport = require("serialport")
var SerialPort = serialport.SerialPort
var serialPort = new SerialPort(process.env.IDEAL_SERIAL, {
  baudrate: 38400,
  parser: serialport.parsers.readline("\n")
});

function sendJSON(data) {
  IDEALJSONClient.post('jsonreading/', data, function (err, res, body) {
      if(err) {
        //console.log(err);
        client.log({"statusCode": res.statusCode});
      } else {
        return client.log({"statusCode": res.statusCode});
      }
  });
}

serialPort.on("open", function () {
  serialPort.on('data', function(data) {
    console.log('data received : ' + data);
    try {
      js_data = JSON.parse(data);
    } catch (er) {
      return;
    }
    JSON_data = {
      "basestation_address": BaseStationAddress,
      "sensorbox_address": js_data.node_id + HomeOffset,
      "timestamp": (Date.now())/100,
      "timeinterval": 60
    }
    switch(js_data.packet_type) {
      case packetType.TEMPHUM:
        JSON_data["internal_temperature"] = js_data.val0;
        JSON_data["humidity"] = js_data.val1;
        client.log(JSON_data);
        sendJSON(JSON_data);
        break;
      case packetType.BROADCAST:
        break;
      case packetType.CURRENT:
        JSON_data["current"] = js_data.val0;
        client.log(JSON_data);
        sendJSON(JSON_data);
        break;
      case packetType.CLAMPS:
        JSON_data["clamp_temperature1"] = js_data.val0;
        JSON_data["clamp_temperature2"] = js_data.val1;
        client.log(JSON_data);
        sendJSON(JSON_data);
        break;
      case packetType.LIGHT:
        JSON_data["light"] = js_data.val0;
        client.log(JSON_data);
        sendJSON(JSON_data);
        break;
      case packetType.GAS:
        JSON_data["gas_pulse"] = js_data.val0;
        client.log(JSON_data);
        sendJSON(JSON_data);
        break;
    }
  });
});

serialPort.on("error", function (_error) {
  client.log("Serial Port error: " + _error)
})


process.on('uncaughtException', function(err) {
    // handle the error safely
    client.log('uncaughtException: ' + err);
    var killtimer = setTimeout(function() {
          process.exit(1);
        }, 3000);
    // But don't keep the process open just for that!
    killtimer.unref();
});
