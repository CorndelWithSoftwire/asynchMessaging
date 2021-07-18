
ActiveMq = require("./ActiveMqConnection.js");

// Example Request/Response client
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
        let requestList = [];
        mqConnection.subscribe(respQueueSpec, 
            (data, headers) => {
                  console.log('Response', data, headers);
                  let correlationId = headers["correlation-id"];
                  if ( correlationId && requestList[correlationId] ) {
                    console.log('correlates ' + requestList[correlationId]);
                  } else {
                      console.log("no correlation.")
                  }
                }
        );

        for ( let i = 0; i < 2; i++){
            header["correlation-id"] = i;
            requestList[i] = "request " + i + ": " + requestText;
            mqConnection.publish(reqQueueSpec, requestText + "," + i, header);
        } 
        
        const timeout = 1000 * 60; // 1000 * 60 * 3 
        setTimeout(() => {
            mqConnection.disconnect(
                () => console.log('DISCONNECTED')
            );
        }, timeout);
    }
).catch(e => console.log(e));


