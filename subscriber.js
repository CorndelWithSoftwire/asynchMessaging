
ActiveMq = require("./ActiveMqConnection.js");

// Example Consumer

ActiveMq.getConnection().then(
    ( mqConnection  ) => {
        var TOPIC = '/topic/home.thermostats';
        mqConnection.subscribe(TOPIC, (data, headers) => {
           console.log('GOT A MESSAGE', data, headers);
        });  
    }
).catch( e => console.log(e) );


