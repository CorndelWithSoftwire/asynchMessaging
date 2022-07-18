
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
const thermostatStatusTopic = "estate/online/thermostats";
const dataTopicRoot = 'estate/thermostats';
const willTopicRoot = 'estate/status';
const dataTopicWild = dataTopicRoot + "/#";
const willTopicWild = willTopicRoot + "/#";


// values to be set from command line
let isCleaning;

const isCleaningText = process.argv[2];
isCleaning = (isCleaningText && isCleaningText == "c");


console.log("Monitor, "
    + (isCleaning ? "cleaning subscription" : "continuing subscription")
);

// state shared by connection function and callbacks
// (should refactor to an Object)
let client;
let subscribed = false;

// Cleaning requires a separate connection amd disconnection.
// Wrap that in a promise, if not cleaning create a dummy promise that immediately resolves
let preWorkPromise;
if (isCleaning) {
    preWorkPromise = cleanSubscriptions();
} else {
    preWorkPromise = new Promise((resolve, reject) => {
        resolve("no cleaning");
    }
    );
}

// clean or dummy, then connect to start monitoring
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
            subscribed = true;
        }
    });

    // need to reinitialise client after server restart
    client.on('offline', () => {
        // try every 10 seconds, otherwise we get thousands of retries     
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
    if (topic.startsWith(willTopicRoot)) {
        const jsonData = JSON.parse(data);
        //console.log("status on " + topic + "=" + data);
        processStatusMessage(jsonData, headers)
    } else if (topic.startsWith(dataTopicRoot)) {
        const jsonData = JSON.parse(data);
        //console.log('Received telemetry on ', topic, ": ", jsonData);
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

    client.subscribe(willTopicWild, options).then((info) => {
        console.log('Subscribed', info);
    }).catch(e => {
        console.log("Subscribe exception", e);
    });

    client.subscribe(dataTopicWild, options).then((info) => {
        console.log('Subscribed', info);
    }).catch(e => {
        console.log("Subscribe exception", e);
    });

}


// Business Logic - Here we interpret the Telemetry Messaged


function processThermostatMessage(thermostatData, headers) {

    // to simplify debugging we are including location info in payload
    // but we use the topic as the definitive source of location info
    const topicIds = parseTopic(headers.topic);
    if ( ! topicIds ){
        // couldn't make sense of message, can't process it
        return;
    }
    
    const { groupId, propertyId} = topicIds;

    if (headers.retain) {
        // Don't need this, but might be interesting to know ...
        console.log("Processing retained message");
    }

    console.log(`Received for ${groupId}/${propertyId}`, thermostatData);

    // TODO: add your code here 
    
}

// thermostat status updates on Will topics
// the set of all these topics defines our estate
function processStatusMessage(data, headers) {
    console.log("Status:  ", data);

    // The status messages tell us what thermostats are in our estate
    // and whether they are currently online. We could use this to
    // send infotmation to a User Interface
}


// extract group and property ids from topic
function parseTopic(topic){ 
    const topicParts = topic.split("/");
    if (topicParts.length < 3) {
        console.log("Unexpected topic " + topic);
        return null;
    }
    const groupStr = topicParts[topicParts.length - 2];
    const propertyStr = topicParts[topicParts.length - 1];
    if ( !groupStr || ! propertyStr){
        console.log("invalid topic " + topic);
        return null;
    }
    const groupId = parseInt(groupStr);
    const propertyId = parseInt(propertyStr);
    return { groupId, propertyId };
}



// print helpful message and exit
function usageExit(message) {
    console.log(message);
    console.log("Usage: node homeMonitor.js threshold duration [c]");
    console.log("threshold: integer degrees, detect if temperature drops below this");
    console.log("duration: integer minutes, report problem if below threshold for this long");
    console.log("c: optional request for clean start, discarding durable subscription");
    console.log("Example: node homeMonitor.js 18 5 c");
    process.exit(1);
}



