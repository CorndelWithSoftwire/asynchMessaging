
import { Channel } from 'queueable';
import ActiveMq from "./ActiveMqConnection.js";

const channel = new Channel();

let mqConnection = await ActiveMq.getConnection();

let queueName = process.argv[2];
if (!queueName || queueName.length == 0) {
    queueName = "defaultReq";
}
const reqQueueSpec = "/queue/" + queueName;
  
mqConnection.subscribe(queueName, 
      (data, headers) => 
          console.log(headers)
);

console.log("subscribed to ", reqQueueSpec);

// for-await-of uses the async iterable protocol to consume the queue sequentially
for await (const n of channel) {
  console.log("received", n); 
}


