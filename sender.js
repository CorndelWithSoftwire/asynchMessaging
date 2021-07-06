
ActiveMq = require("./ActiveMqConnection.js");

ActiveMq.getConnection().then(
    ( mqConnection  ) => {
        var QUEUE = '/queue/thing';
        mqConnection.subscribe(QUEUE, function (data, headers) {
           console.log('GOT A MESSAGE', data, headers);
        });

        mqConnection.publish(QUEUE, 'A message!');
  
        setTimeout(function () {
            mqConnection.disconnect(function () {
              console.log('DISCONNECTED');
           });
        }, 50000);
    }
).catch( e => console.log(e) );


