import { Channel } from 'queueable';
import ActiveMq from "./ActiveMqConnection.js";

const channel = new Channel();

let mqConnection = await ActiveMq.getConnection();

const QUEUE = '/queue/defaultReq';
  
mqConnection.subscribe(QUEUE, 
      (data, headers) => 
          channel.push( [data, headers] )
);


// for-await-of uses the async iterable protocol to consume the queue sequentially
for await (const message of channel) {
  console.log("Received: ", message); 
}