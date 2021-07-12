
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
           if ( headers["reply-to"] && headers["reply-to"].length > 0 ){
               // persistent response for persistent request
               let respHeader = { "persistent": headers["persistent"] };

               // reply to specfified queue
               mqConnection.publish(headers["reply-to"], 'a response to ' + data, respHeader);
           } else {
               console.log("No response destination specified");
           }
        }); 
        console.log("Booking service listening on " + reqQueueSpec); 
    }
).catch( e => console.log(e) );



