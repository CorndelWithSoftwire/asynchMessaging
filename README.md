# asynchMessaging
Messaging and asynchronous communication patterns. 

Starting point for [https://corndel.atlassian.net/wiki/spaces/AC/pages/2855763973/Publish+Subscribe+-+Simple+Broadcast+Scenarios](Broadcast Scenarios)

* simpleThermostat.js - publishes 

Verify by subscribing using mqtt tools: 
```
    npx mqtt sub home/#
```

example client code:

* subscriber.js - STOMP client

* mqttSubscriber - mqtt client, use as starting point for further investigateion

