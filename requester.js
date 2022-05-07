
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
    let mqConnection = await ActiveMq.getConnection(
        "localhost",
        61613,
        {
            retries: 10,  // reduce these for testing errors
            delay: 10000
        }
    );

    mqConnection.publish(reqQueueSpec, requestText, header);

    let result = await ActiveMq.disconnect(mqConnection);
    console.log("done", result);


} catch (e) {
    console.log("Caught", e);
};


