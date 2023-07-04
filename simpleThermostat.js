var mqtt = require('async-mqtt');

const dataTopic = 'home/thermostats';

const connectOptions = {
    // TODO options to be investigated
}

var client = mqtt.connect('mqtt://localhost', connectOptions);


let location = process.argv[2];
if (!location || location.length == 0) {
    location = "hall";
}

console.log("Thermostat location: " + location);

client.on("connect", () => {
    console.log("Thermostat connected ");
    publishTelemetry();
});

// publish a fake thermostat reading every 10 seconds
function publishTelemetry() {
    let temperature = 99; // TODO vary the temperature 
    setInterval(() => { 
        const reading = {
            "location": location,
            "time": Date.now(),
            "temperature": temperature
        };
        const message = JSON.stringify(reading);
        const options = {
            // TODO experiment
        };
        client.publish(dataTopic, message, options).then((e) => {
            if (e) {
                console.log("Error:" + JSON.stringify(e));
            } else {
                console.log("OK " + JSON.stringify(reading));
            }

        });
    }, 1000 * 10);
}

