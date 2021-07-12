
ActiveMq = require("./ActiveMqConnection.js");

// Send one request
//
// node requester queueName "request text" priority

let reqQueueName = process.argv[2];
if (!reqQueueName || reqQueueName.length == 0) {
    reqQueueName = "defaultReq";
}
const reqQueueSpec = "/queue/" + reqQueueName;
const respQueueSpec = reqQueueSpec + "Resp";


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
    "priority": requestPriority,
    "reply-to": respQueueSpec,
    "persistent" : true
};

ActiveMq.getConnection().then(
    (mqConnection) => {
        mqConnection.subscribe(respQueueSpec, 
            (data, headers) => 
                  console.log('Response', data, headers)
        );

        mqConnection.publish(reqQueueSpec, requestText, header);
        
        const timeout = 1000 * 60; // 1000 * 60 * 3 
        setTimeout(() => {
            mqConnection.disconnect(
                () => console.log('DISCONNECTED')
            );
        }, timeout);
    }
).catch(e => console.log(e));

