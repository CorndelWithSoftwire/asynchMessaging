'use strict';
import StompClient from "stomp-client";

// Wrapper for a Stomp conenction to ActiveMQ
//
// getConnection() returns a Promise that resolves to a stomp-client 
// which can the be used for publish() subscribe() 
// You can also call disconnect() when your application is about to shut down.
// After this the application cannot reconnect, in normal running reconnections
// are managed by the library.
//
// TODO: better to have an OO solution so that we can call disconnect on connection object
// rather ugly to pass connection to disconnect
// 




var ActiveMqConnection = {
   getConnection: function (
          SERVER_ADDRESS = '127.0.0.1', 
          SERVER_PORT = 61613,
          CONFIG =  {
            retries : 50,
            delay : 1000
         }
      ) {
     
      var thePromise = new Promise((resolve, reject) => {
      
         var myClient = new StompClient(
            SERVER_ADDRESS, SERVER_PORT, 
            '', '', '1.0', null, 
            CONFIG
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
              
               resolve(myClient);
            },
            (e) => {
               console.log("connection failed " + e);
               reject(e);
            }
         );
      });
      return thePromise;
   },

   disconnect: function (connection) {
     
      var thePromise = new Promise((resolve, reject) => {
         connection.disconnect(
            () => resolve("disconnected")
         )
      });

      return thePromise;
   }
   
};

// Example usage

/* 
try {
    let mqConnection = await ActiveMq.getConnection();
   
    mqConnection.publish(reqQueueSpec, requestText, header);
    let result = await ActiveMq.disconnect(mqConnection);
    console.log("done", result);  
    
        
} catch (e) {
    console.log("Caught", e);
};
*/

export default ActiveMqConnection;