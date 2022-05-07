
import ActiveMq from "./ActiveMqConnection.js";

// Send one request
//
// node requester queueName "request text" priority

let reqQueueName = process.argv[2];
if (!reqQueueName || reqQueueName.length == 0) {
    reqQueueName = "defaultReq";
}
const reqQueueSpec = "/queue/" + reqQueueName;


let requestText = process.argv[3];
if (!requestText || requestText.length == 0) {
    requestText = "book room 101";
}

let priorityText = process.argv[4];
if (!priorityText || priorityText.length == 0) {
    priorityText = "3";
}

const requestPriority = parseInt(priorityText);

const header = {
    priority: requestPriority
};

try {
    let mqConnection = await ActiveMq.getConnection();
    let mqConnection2 = await ActiveMq.getConnection();
   
    mqConnection.publish(reqQueueSpec, requestText, header);

    mqConnection2.publish(reqQueueSpec, requestText + " other", header);

    let result = await ActiveMq.disconnect(mqConnection);
    console.log("done", result);  

    let result2 = await ActiveMq.disconnect(mqConnection2);
    console.log("done other", result2); 
    
        
} catch (e) {
    console.log("Caught", e);
};


