
var mqtt = require('async-mqtt');
var client = mqtt.connect('mqtt://localhost');

// Home Monitor - Subscribes to Thermostate Telemetry and detects possible problems
//
// node homeMonitor.js threshold duration
//
// threshold temperature in Celsius
// duration in minutes, 
//
// raises problem if temperature is below threshold for specified duration

const TOPIC = 'home/thermostats';
let threshold;
let duration;

const thresholdText = process.argv[2];
if (thresholdText && thresholdText.length > 0) {
    threshold = parseInt(thresholdText);
}

if (!threshold) {
    usageExit("Invalid threshold, specify a numeric temperature.");
}

const durationText = process.argv[3];
if (durationText && durationText.length > 0) {
    duration = parseInt(durationText);
}

if (!duration) {
    usageExit("Invalid duration, specify a numeric duration.");
}

const durationMillis = duration * 60 * 1000;

console.log("Monitoring " + TOPIC + ": temperature below " + threshold + "C for " + duration + " min.");

client.on("message", (topic, data, headers) => {  
    const jsonData = JSON.parse(data);
    console.log('Received telemetry on ',topic, ": ",  jsonData);
    processThermostatMessage(jsonData, headers);
});

client.on("connect", () => {
    client.subscribe(TOPIC).then( (info) => {
        console.log('Subscribed', info); 
    });
});


let activeLocations = {};

function processThermostatMessage(data, headers) {

    const location = data.location;
    if (!location || location.length == 0) {
        console.log("Invalid data received ", data, headers);
        return;
    }

    if ( headers.retain ){
        console.log("Processing retained message");
    }

    if (!activeLocations[data.location]) {
        // intialise location record
        activeLocations[data.location] = { belowThreshold: false }
    }
    Object.assign(activeLocations[location],
        { time: data.time, temperature: data.temperature });

    if (activeLocations[location].temperature >= threshold) {
        if (activeLocations[location].belowThreshold) {
            console.log("Temperature risen above threshold " + location);
            activeLocations[location].belowThreshold = false;
        }
    } else {
        if (activeLocations[location].belowThreshold) {
            // already seen some low temperatures, check durat8ion
            const timeBelowThreshold =
                data.time - activeLocations[location].thresholdCrossTime;
            if (timeBelowThreshold > durationMillis) {
                // low temperature for duraton, notify problem 
                // TODO: perhaps notify periodically, rather than every subsequent reading?
                console.log("Sustained low temperature from " + location + ", " + JSON.stringify(data))
            }
        } else {
            activeLocations[location].belowThreshold = true;
            activeLocations[location].thresholdCrossTime = data.time;
        }
    }

}

// print helpful message and exit
function usageExit(message) {
    console.log(message);
    console.log("Usage: node homeMonitor.js threshold duration");
    process.exit(1);
}


