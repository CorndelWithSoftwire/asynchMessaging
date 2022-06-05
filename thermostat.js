var mqtt = require('async-mqtt');

let group = process.argv[2];
let groupId;
if (!group || group.length == 0) {
    usageExit("specify numeric ids for group and property");
} else {
    groupId = parseInt(group);
}

let property = process.argv[3];
if (!property || property.length == 0) {
    usageExit("specify numeric ids for group and property");
} else {
    propertyId = parseInt(property);
}

let propertyName = process.argv[4];
if (!propertyName || propertyName.length == 0) {
    usageExit("specify property name");
}

console.log("Thermostat group/property: " + groupId + "/" + propertyId);
const dataTopic = 'SunnyVista/thermostats/' + groupId + "/" + propertyId;

const willTopic = 'SunnyVista/status/' + groupId + "/" + propertyId;

// time recorded for connected status too
const timeStarted = new Date().getTime();
const willPayload = {
    'message': "Thermostat dead",
    'publishing': false,
    'groupId': groupId,
    'property': propertyId,
    'propertyName': propertyName,
    'timeStarted': timeStarted
};
const QOS = 1;

const connectOptions = {
    'qos': QOS,
    'will': {
        'topic': willTopic,
        'payload': JSON.stringify(willPayload),
        'retain': true,
        'qos': QOS,
        'timeStarted': timeStarted
    }
}

var client = mqtt.connect('mqtt://localhost', connectOptions);

let fakeTempSkew = 15;
let fakeTemp = 10;



client.on("connect", () => {

    publishStatus();
    publishTelemetry();
});

// Will and Testament will publish a retained message if we die
// Replace that with a live status when we reconnect
// (If application had ability to shutdown cleanly, should pulish a "clean shutdown" too)
function publishStatus() {
    // status has all the data set up for the Will, but with message and publishing flag adjusted
    const status = Object.assign({}, willPayload);
    status.message = "Thermostat Publishing"
    status.publishing = true;
    console.log(status);
    const options = {
        "retain": true,
        "qos": QOS
    };
    client.publish(willTopic, JSON.stringify(status), options).then((e) => {
        if (e) {
            console.log("Status info:" + JSON.stringify(e));
        } else {
            console.log("Connection status pubished ");
        }

    });
}

// publish a fake thermostat reading every 10 seconds
function publishTelemetry() {
    setInterval(() => {
        fakeTempSkew++;
        fakeTempSkew %= 20;

        const reading = {
            "groupId": groupId,
            "property": propertyId,
            "time": Date.now(),
            "temperature": fakeTemp + fakeTempSkew
        };
        const message = JSON.stringify(reading);
        const options = {
            "retain": true,
            "qos": QOS
        };
        const propertyTopicc = dataTopic;
        client.publish(propertyTopicc, message, options).then((e) => {
            if (e) {
                console.log("Telemetry:", JSON.stringify(e), reading);
            } else {
                console.log("OK " + JSON.stringify(reading));
            }

        }).catch((e) => {
            console.log("Telemetry catch: ", e)
        });
    }, 1000 * 10);
}

// print helpful message and exit
function usageExit(message) {
    console.log(message);
    console.log("Usage: node thermostat.js group property propertyName");
    process.exit(1);
}

