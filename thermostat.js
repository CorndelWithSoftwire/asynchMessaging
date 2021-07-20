var mqtt = require('async-mqtt');
var client = mqtt.connect('mqtt://localhost');

let fakeTempSkew = 15;
let fakeTemp = 10;

let location = process.argv[2];
if (!location || location.length == 0) {
    location = "hall";
}

console.log("Thermostat location: " + location);

// publish a fake thermostat reading every 10 seconds
setInterval( () => {
    fakeTempSkew++;
    fakeTempSkew %= 20;

    const reading = {
        "location": location,
        "time": Date.now(),
        "temperature": fakeTemp + fakeTempSkew
    };
    const message = JSON.stringify(reading);
    const options = {
        "retain" : true,
    };
    client.publish('home/thermostats', message, options).then((e) => {
        if (e) {
            console.log("Error:" + JSON.stringify(e));
        } else {
            console.log("OK " + JSON.stringify(reading) );
        }

    });
}, 1000 * 10 );

