
ActiveMq = require("./ActiveMqConnection.js");

// Responder, with example selector

let reqQueueName = process.argv[2];
if (!reqQueueName || reqQueueName.length == 0) {
    reqQueueName = "defaultReq";
}
const reqQueueSpec = "/queue/" + reqQueueName;

const subscribeHeader = {
    selector: "JMSPriority < 6"
};

ActiveMq.getConnection().then(
    ( mqConnection  ) => {
        mqConnection.subscribe(reqQueueSpec, subscribeHeader, (data, headers) => {
           console.log('Request\n', data, headers);
        }); 
        console.log("Booking service listening on " + reqQueueSpec); 
    }
).catch( e => console.log(e) );



