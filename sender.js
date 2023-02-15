
let ActiveMq = require("./ActiveMqConnection.js");

async function main() {
    let myConnection = await ActiveMq.getConnection()

    const QUEUE = '/queue/travel/search';

    let payload = {
        "user": "DaveA",
        "action": "search",
        "type": "accommodation",
        "criteria": ["budget", "breakfast"],
        "location": "Valencia, ESP"
    }

    let body = JSON.stringify(payload);

    let headers = {
        "priority": 2,
        "persistent": true,
        "expires": Date.now() + 30000,
    };

    myConnection.publish(QUEUE, body, headers);
    myConnection.disconnect(
        () => console.log('DISCONNECTED')
    );

}

main();



