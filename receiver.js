
ActiveMq = require("./ActiveMqConnection.js");


var queueName = process.argv[2];
if (!queueName || queueName.length == 0) {
    queueName = "defaultIn"
}

var acknack = process.argv[3];
acknack = acknack ? acknack.toLowerCase() : "";
if ( acknack !== "ack"  && acknack !== "nack" ){
    acknack = false;
    console.log("no ACK or NACK, messages will remain pending")
} else {
    console.log("messages response will be " + acknack.toUpperCase() );
}

const queueSpec = "/queue/" + queueName;

console.log("Subscribing to " + queueSpec);
ActiveMq.getConnection().then(
    (mqConnection) => {
        let x = mqConnection.subscribe(queueSpec,
            { ack: 'client-individual' },
            (data, headers) => {
                if (acknack){
                     mqConnection[acknack]( parseInt(headers["subscription"]), headers["message-id"] );
                } 
                console.log('Received: ', data, "\n", headers);
            });
    }
).catch(e => {
    console.log(e);
});


