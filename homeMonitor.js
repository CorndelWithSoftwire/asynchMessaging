
var mqtt = require('async-mqtt');

// Home Monitor - Subscribes to Thermostate Telemetry and detects possible problems
//
// node homeMonitor.js threshold duration [c]
//
// threshold temperature in Celsius
// duration in minutes,
// c clean Durable Subscription 
//
// raises problem if temperature is below threshold for specified duration

const estateInfoTopic = "estate/Overview";
const dataTopicRoot = 'estate/thermostats';
const willTopicRoot = 'estate/status';
const dataTopicWild = dataTopicRoot + "/#";
const willTopicWild = willTopicRoot + "/#";


// values to be set from command line
let threshold;
let duration;
let isCleaning;

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
isCleaning = (isCleaningText && isCleaningText == "c");


console.log("Monitoring temperature below " 
            + threshold + "C for " 
            + duration + " min."
            + (isCleaning ? "cleaning subscription" : "continuing subscription")
            );

// state shared by connection function and callbacks
// (should refactor to an Object)
let client;
let subscribed = false;



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

// Clean Connection
// Instructs Server to ignore any previous Durable Subscription
// Must then disconnect so that new Durable Subscription can be created.
// Returns a Promise that will be resolved when clean is complete
// Will retry if server is down
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
            console.log("on cleaner connection error", info);
            // conections retry, so do nothing. 

            // if we wanted to stop end the client and reject the promise
            //cleanClient.end();
            //reject("clean failed");
        });
    });
    return promise;
}

// Connect and Subscribe
// also used to reconnect after server failure, otherwise subscriptions don't resume
function connectToServer(info) {
    console.log("connecting after", info)
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
            publishEstate();
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
    if (topic.startsWith(willTopicRoot) ){
        const jsonData = JSON.parse(data);
        console.log("status on " + topic + "=" + data);
        processWillMessage(jsonData, headers)
    } else if (topic.startsWith(dataTopicRoot) ) {
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

    client.subscribe(dataTopicWild, options).then((info) => {
        console.log('Subscribed', info);
    }).catch(e => {
        console.log("Subscribe exception", e);
    });

    client.subscribe(willTopicWild, options).then((info) => {
        console.log('Subscribed to wills ', info);
    }).catch(e => {
        console.log("Will Subscribe exception", e);
    });
}

// publish Estate Info
function publishEstate(){
    estateInfo = {propertyGroups: [
        {
          id: 1,
          name: 'The Avenue',
          children : [
            {
               id: 101,
               name: "Beech",
               online: true,
               alerts: []
            },
            {
               id: 103,
               name: "Oak",
               online: false,
               alerts: []
            },

          ]
        },{
          id: 2,
          name: 'Broadway',
          children : [
            {
               id: 201,
               name: "Astoria",
               online: true,
               alerts: [{time: 0, text: "Below Threshold"}]
            }
          ]
        }
      ]
    }
    
    const message = JSON.stringify(estateInfo);
        const options = {
            "retain": true,
            "qos" : 1
        };
        client.publish(estateInfoTopic, message, options).then((e) => {
            if (e) {
                console.log("Estate Info:", e );
            } else {
                console.log("Estate Info publised ", message);
            }

        }).catch( (e) => {
            console.log("Telemetry catch: ", e)
        });
}

// Business Logic - Here we interpret the Telemetry Messaged

let activeGroups = {};

function processThermostatMessage(data, headers) {

    // to simplify debugging including location info in payload
    const topic = headers.topic;
    const topicParts = topic.split("/");
    if (topicParts.length < 3){
        console.log("Unexpected topic " + topic);
        return;
    }
    const group = topicParts[topicParts.length-2];
    const property = topicParts[topicParts.length-1];
    const location = data.location;
    if (!group || group.length == 0) {
        console.log("Invalid group received ", data, headers);
        return;
    }
    if (!property || property.length == 0) {
        console.log("Invalid property received ", data, headers);
        return;
    }

    if (headers.retain) {
        console.log("Processing retained message");
    }

    
    if (!activeGroups[group]) {
        // intialise location record
        activeGroups[group] = { }
    }

    const currentGroup = activeGroups[group];

    if (!currentGroup[property]) {
        // intialise location record
        currentGroup[property] = { belowThreshold: false }
    }
    Object.assign(currentGroup[property],
        { time: data.time, temperature: data.temperature });

    if (currentGroup[property].temperature >= threshold) {
        if (currentGroup[property].belowThreshold) {
            console.log("Temperature risen above threshold " + group + "/" + property);
            currentGroup[property].belowThreshold = false;
        }
    } else {
        if (currentGroup[property].belowThreshold) {
            // already seen some low temperatures, check durat8ion
            const timeBelowThreshold =
                data.time - currentGroup[property].thresholdCrossTime;
            if (timeBelowThreshold > durationMillis) {
                // low temperature for duraton, notify problem 
                // TODO: perhaps notify periodically, rather than every subsequent reading?
                console.log("Sustained low temperature from " 
                                       + group + "/" + property +", " + JSON.stringify(data))
            }
        } else {
            currentGroup[property].belowThreshold = true;
            currentGroup[property].thresholdCrossTime = data.time;
        }
    }

}

function processWillMessage(data, headers){
   console.log("will ", data);
   if (headers.retain) {
    console.log("Processing retained will message");
   }
}

// print helpful message and exit
function usageExit(message) {
    console.log(message);
    console.log("Usage: node homeMonitor.js threshold duration [c]");
    process.exit(1);
}


