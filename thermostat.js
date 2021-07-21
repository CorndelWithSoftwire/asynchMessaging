var mqtt = require('async-mqtt');

const dataTopic = 'home/thermostats';
const willTopic = 'home/status/thermostats'
const connectOptions = {
    'will': {
        'topic': willTopic,
        'payload': "Thermostats Dead",
        'retain': true,
        'qos': 2
        // seems to have no effect in ActiveMQ
        //'properties': {
        //    'willDelayInterval': 60 * 1000
        //}
    }
    // some brokers require willDelayInterval >= sessionExpiryInterval
    //, 'properties': {
    //    'sessionExpiryInterval': 60 * 1000
    //}
}

var client = mqtt.connect('mqtt://localhost', connectOptions);

let fakeTempSkew = 15;
let fakeTemp = 10;

let location = process.argv[2];
if (!location || location.length == 0) {
    location = "hall";
}

console.log("Thermostat location: " + location);

client.on("connect", () => {
    console.log("Thermostat connected ");
    publishStatus();
    publishTelemetry();
});

// Will and Testament will publish a retained message if we die
// Replace that with a live status when we reconnect
// (If application had ability to shutdown cleanly, should pulish a "clean shutdown" too)
function publishStatus(){
    const options = {
        "retain": true,
        "qos" : 2
    };
    client.publish(willTopic, "Thermostat Publishing", options).then((e) => {
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
            "location": location,
            "time": Date.now(),
            "temperature": fakeTemp + fakeTempSkew
        };
        const message = JSON.stringify(reading);
        const options = {
            "retain": true,
            "qos" : 2
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

