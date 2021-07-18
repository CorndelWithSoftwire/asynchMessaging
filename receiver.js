
ActiveMq = require("./ActiveMqConnection.js");

// Example Consumer from Queue

ActiveMq.getConnection().then(
    ( mqConnection  ) => {
        var QUEUE = '/queue/oneway';
        mqConnection.subscribe(QUEUE, (data, headers) => {
           console.log('GOT A MESSAGE', data, headers);
        });  
    }
).catch( e => console.log(e) );


