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

console.log("Thermostat group/property: " + groupId + "/" + propertyId);
const dataTopic = 'estate/thermostats/'+ propertyId + "/" + groupId;

const willTopic = 'estate/status/'+ propertyId + "/" + groupId;
const willPayload = {
    'message': "Thermostat dead",
    'groupId' : groupId,
    'property' : propertyId
};
const QOS = 1;
const connectOptions = {
    'qos': QOS,
    'will': {
        'topic': willTopic,
        'payload': JSON.stringify(willPayload),
        'retain': true,
        'qos': QOS
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
function publishStatus(){
    const status = {
        'message': "Thermostat connected",
        'groupId' : groupId,
        'property' : propertyId
   };
   console.log(status);
    const options = {
        "retain": true,
        "qos" : QOS
    };
    client.publish(willTopic, JSON.stringify(status) ).then((e) => {
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
            "groupId" : groupId,
            "property" : propertyId,
            "time": Date.now(),
            "temperature": fakeTemp + fakeTempSkew
        };
        const message = JSON.stringify(reading);
        const options = {
            "retain": true,
            "qos" : QOS
        };
        client.publish(dataTopic, message, options).then((e) => {
            if (e) {
                console.log("Telemetry:", JSON.stringify(e), reading );
            } else {
                console.log("OK " + JSON.stringify(reading));
            }

        }).catch( (e) => {
            console.log("Telemetry catch: ", e)
        });
    }, 1000 * 10);
}

// print helpful message and exit
function usageExit(message) {
    console.log(message);
    console.log("Usage: node thermostat.js group property");
    process.exit(1);
}

