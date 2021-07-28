
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
    if (topic.startsWith(willTopicRoot)) {
        const jsonData = JSON.parse(data);
        console.log("status on " + topic + "=" + data);
        processWillMessage(jsonData, headers)
    } else if (topic.startsWith(dataTopicRoot)) {
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

const propertyGroups = [
    "unknown",
    "The Avenuue",
    "Broadway",
    "Lexington",
    "Americas",
    "Fifth"
];

// build the estate info here from Will messages
const estateInfo = [];

// publish Estate Info
function publishEstate() {
   
    const message = JSON.stringify({"propertyGroups" : estateInfo});

    const options = {
        "retain": true,
        "qos": 1
    };
    client.publish(estateInfoTopic, message, options).then((e) => {
        if (e) {
            console.log("Estate Info:", e);
        } else {
            console.log("Estate Info publised ", message);
        }

    }).catch((e) => {
        console.log("Telemetry catch: ", e)
    });
}

// Business Logic - Here we interpret the Telemetry Messaged

let activeGroups = {};

function processThermostatMessage(data, headers) {

    // to simplify debugging including location info in payload
    // but use the topic as the definitive source
    const topicIds = parseTopic(headers.topic);
    if ( ! topicIds ){
        return;
    }
    
    const { groupId, propertyId} = topicIds;

    if (headers.retain) {
        console.log("Processing retained message");
    }


    if (!activeGroups[groupId]) {
        // intialise location record
        activeGroups[groupId] = {}
    }

    const currentGroup = activeGroups[groupId];

    if (!currentGroup[propertyId]) {
        // intialise location record
        currentGroup[propertyId] = { belowThreshold: false }
    }
    Object.assign(currentGroup[propertyId],
        { time: data.time, temperature: data.temperature });

    if (currentGroup[propertyId].temperature >= threshold) {
        if (currentGroup[propertyId].belowThreshold) {
            console.log("Temperature risen above threshold " + groupId + "/" + propertyId);
            currentGroup[propertyId].belowThreshold = false;
        }
    } else {
        if (currentGroup[propertyId].belowThreshold) {
            // already seen some low temperatures, check durat8ion
            const timeBelowThreshold =
                data.time - currentGroup[propertyId].thresholdCrossTime;
            if (timeBelowThreshold > durationMillis) {
                // low temperature for duraton, notify problem 
                // TODO: perhaps notify periodically, rather than every subsequent reading?
                console.log("Sustained low temperature from "
                    + groupId + "/" + propertyId + ", " + JSON.stringify(data))
            }
        } else {
            currentGroup[propertyId].belowThreshold = true;
            currentGroup[propertyId].thresholdCrossTime = data.time;
        }
    }
}

// publish information about one thermostat, typically when status changes
function publishThermostatStatus(thermostatInfo){
    const message = JSON.stringify(thermostatInfo);
    const options = {
        "retain": false, // single topic for all status changes, so retained less useful
        "qos": 1
    };
    client.publish(thermostatStatusTopic, message, options).then((e) => {
        if (e) {
            console.log("thermostat Status:", e);
        } else {
            console.log("thermostat status published ", message);
        }

    }).catch((e) => {
        console.log("thermostat Status catch: ", e)
    });
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

// thermostat status updates on Will topics
// the set of all these topics defines our estate
function processWillMessage(data, headers) {
    console.log("will ", data);
    if (headers.retain) {
        console.log("Processing retained will message");
    }
    const topicIds = parseTopic(headers.topic);
    if ( ! topicIds ){
        return;
    }
    const { groupId, propertyId} = topicIds;
    // test for NaN
    if ( groupId !== groupId || propertyId !== propertyId){
        return;
    }

    let existingGroup = estateInfo.find( (e) =>{
        return e.id === groupId;
    });

    if ( ! existingGroup ){
        existingGroup = { "id" : groupId, "name" : propertyGroups[groupId], "children": []};
        estateInfo.push ( existingGroup );
    }
  
    let isNewProperty;
    const existingProperty = existingGroup.children.find( (e) => {
        return e.id === propertyId;
    })

    if ( existingProperty){
        existingProperty.online = data.publishing;
        isNewProperty = false;
    } else {
        existingGroup.children.push({ 
             "id" : propertyId, 
             "name" : data.propertyName, 
             "online" : data.publishing
        });
        isNewProperty = true;
    }
  
    if ( isNewProperty ){
        publishEstate();
    } else {

        const thermostatStatus = Object.assign({ 'groupId' : groupId}, existingProperty);
        publishThermostatStatus(thermostatStatus);          
        
    }

   

}

// print helpful message and exit
function usageExit(message) {
    console.log(message);
    console.log("Usage: node homeMonitor.js threshold duration [c]");
    process.exit(1);
}

/* let estateInfo = {
    propertyGroups: [
        {
            id: 1,
            name: 'The Avenue',
            children: [
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
        }, {
            id: 2,
            name: 'Broadway',
            children: [
                {
                    id: 201,
                    name: "Astoria",
                    online: true,
                    alerts: [{ time: 0, text: "Below Threshold" }]
                }
            ]
        }
    ]
} */

