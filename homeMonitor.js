
var mqtt = require('async-mqtt');

// Home Monitor - Subscribes to Thermostate Telemetry and detects possible problems
//
// node homeMonitor.js threshold duration
//
// threshold temperature in Celsius
// duration in minutes, 
//
// raises problem if temperature is below threshold for specified duration


const dataTopic = 'home/thermostats';
const willTopic = 'home/status/thermostats'
const TOPIC = 'home/#';
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

const isCleaningText = process.argv[4];
const isCleaning = (isCleaningText && isCleaningText.length > 0);

console.log("Monitoring " + TOPIC + ": temperature below " + threshold + "C for " + duration + " min.");

// state shared by connection function and callbacks
// (should refactor to an Object)
let client;
let subscribed = false;

// Connection function, invoked immediately to start processing
// also used to reconnect after server failure, otherwise subscriptions don't resume


function cleanSubscriptions() {
    const connectOptions = {
        "clean": true,
        "clientId": "homeMonitor"
    }
    let cleanClient = mqtt.connect('mqtt://localhost', connectOptions);

    let promise = new Promise((resolve, reject) => {
        cleanClient.on("connect", (info) => {
            console.log("on cleaner connect", info);
            cleanClient.end();
            resolve("clean ok");
        });

        cleanClient.on("error", (info) => {
            console.log("on cleaner error", info);
            reject("clean failed");
        });
    });
    return promise;
}

let preWorkPromise;
if (isCleaning) {
    preWorkPromise = cleanSubscriptions();
} else {
    preWorkPromise = new Promise((resolve, reject) => {
        resolve("no cleaning");
    }
    );



}

preWorkPromise.then((info) => connectToServer(info)).catch(
    (e) => console.log("error", e)
);

function connectToServer(info) {
    console.log("connecting after ", info)
    const connectOptions = {
        "clean": false,
        "clientId": "homeMonitor"
    }
    client = mqtt.connect('mqtt://localhost', connectOptions);
    client.on("message", processMessage);

    client.on("connect", (info) => {
        console.log("onConnect", info);
        if (!subscribed) {
            subscribeToTopics();
            subscribed = true;
        }
    });

    // need to reinitialise client after server restart
    client.on('offline', () => {
        // try every 10 seconds, otherwise we get tjousands of retries     
        setTimeout(() => {
            client.end(true, () => {
                console.log("Connection to server lost, reconnecting ...");
                subscribed = false
                connectToServer();
            });
        }, 1000 * 10);

    });
}

// methods called for MQTT client events

// onMessage handler
function processMessage(topic, data, headers) {
    if (topic === willTopic) {
        console.log("status: " + data);
    } else if (topic === dataTopic) {
        const jsonData = JSON.parse(data);
        console.log('Received telemetry on ', topic, ": ", jsonData);
        processThermostatMessage(jsonData, headers);
    } else {
        console.log("Unexpected topic " + topic);
    }
}

// subscribe, used when client connects or reconnects

function subscribeToTopics() {

    const options = {
        "qos": 1
    };
    client.subscribe(TOPIC, options).then((info) => {
        console.log('Subscribed', info);
    }).catch(e => {
        console.log("Subscribe exception", e);
    });
}





let activeLocations = {};

function processThermostatMessage(data, headers) {

    const location = data.location;
    if (!location || location.length == 0) {
        console.log("Invalid data received ", data, headers);
        return;
    }

    if (headers.retain) {
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


