
ActiveMq = require("./ActiveMqConnection.js");

ActiveMq.getConnection().then(
    ( mqConnection  ) => {
        var QUEUE = '/queue/oneway';
        mqConnection.subscribe(QUEUE, function (data, headers) {
           console.log('GOT A MESSAGE', data, headers);
        });  
    }
).catch( e => console.log(e) );


