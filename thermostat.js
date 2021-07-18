var mqtt = require('async-mqtt');
var client = mqtt.connect('mqtt://localhost');

let fakeTempSkew = 5;
let fakeTemp = 18;

let location = process.argv[2];
if (!location || location.length == 0) {
    location = "hall";
}

console.log("Thermosts location: " + location);

// publish a fake thermostat reading every 10 seconds
setInterval( () => {
    fakeTempSkew++;
    fakeTempSkew %= 10;

    const reading = {
        "location": location,
        "time": Date.now(),
        "temperature": fakeTemp + fakeTempSkew
    };
    const message = JSON.stringify(reading);
    client.publish('home/thermostats', message).then((e) => {
        if (e) {
            console.log("Error:" + e);
        } else {
            console.log("OK " + JSON.stringify(reading) );
        }

    });
}, 1000 * 10 );

