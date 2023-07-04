//
// Example subscriber using Stomp
// Demonstrates inter-working between MQTT publisher and other ActiveMQ clients
ActiveMq = require("./ActiveMqConnection.js");

ActiveMq.getConnection().then(
    ( mqConnection  ) => {
        var TOPIC = '/topic/home.thermostats';
        mqConnection.subscribe(TOPIC, (data, headers) => {
           console.log('GOT A MESSAGE', data, headers);
        });  
    }
).catch( e => console.log(e) );


