
// Simple subscriber using mqtt
// use this to investigate quality of service options
let mqtt = require('async-mqtt');
let client = mqtt.connect('mqtt://localhost');

const TOPIC = 'home/thermostats';

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

    // example of using payload
    const location = data.location;
    if (!location || location.length == 0) {
        console.log("Invalid data received ", data, headers);
        return;
    }

    console.log(`Telemetry for ${data.location}, temperature ${data.temperature}`);

    // example of looking at a header field
    if ( headers.retain ){
        console.log("Processing retained message");
    }

}




