'use strict';
var StompClient = require("stomp-client");

// Wrapper for a Stop conenction to ActiveMQ
//
// getConnection() returns a Promise that resolves to a stomp-client 
// which can the be used for publish() subscribe() 
// You can also call disconnect() when your application is about to shut down.
// After this the application cannot reconnect, in normal running reconnections
// are managed by the library.
// 


var connectedClient = null;

var ActiveMqConnection = {
   getConnection: function (SERVER_ADDRESS = '127.0.0.1', SERVER_PORT = 61613) {
      // TODO: enable credentialws

      var thePromise = new Promise((resolve, reject) => {
         if (connectedClient != null) {
            resolve(connectedClient);
         }

         var myClient = new StompClient(
            SERVER_ADDRESS, SERVER_PORT, 
            '', '', '1.0', null, 
            {
               retries : 50,
               delay : 1000
            }
            );
         myClient.on("connect",
            (e) => console.log("connected " + e)
         );
         myClient.on("reconnecting",
            () => console.log("reconnecting ")
         );
         myClient.on("reconnect",
            (e) => console.log("reconnected " + e)
         );

         myClient.connect(
            () => {
               console.log("STOMP client connected.");
               connectedClient = myClient;
               resolve(connectedClient);
            },
            (e) => {
               console.log("connection failed " + e);
               reject(e);
            }
         );
      });
      return thePromise;
   }
};

// Example usage

/* 
ActiveMqConnection.getConnection().then(

   (connection) => {
      var QUEUE = '/queue/thing';
      connection.subscribe(QUEUE, function (data, headers) {
         console.log('GOT A MESSAGE', data, headers);
      });
      connection.publish(QUEUE, 'A message!');

      setTimeout(function () {
         connection.disconnect(function () {
            console.log('DISCONNECTED');
         });
      }, 5000);
   }
).catch( (e) => console.log(e)); 
*/

module.exports = ActiveMqConnection;
