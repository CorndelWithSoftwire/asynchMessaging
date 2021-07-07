
ActiveMq = require("./ActiveMqConnection.js");

ActiveMq.getConnection().then(
    ( mqConnection  ) => {
        const QUEUE = '/queue/thing';
        mqConnection.subscribe(QUEUE, 
            (data, headers) => 
                  console.log('GOT A MESSAGE', data, headers)
        );

        mqConnection.publish(QUEUE, 'A message!');
        
        const timeout = 1000; // 1000 * 60 * 3 
        setTimeout(() => {
            mqConnection.disconnect( 
                () => console.log('DISCONNECTED')
           );
        }, timeout);
    }
).catch( e => console.log(e) );


