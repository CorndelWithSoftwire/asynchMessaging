

npm install stompjs
npm install net

npm start

Heartbeating is noisy and controlling frequency doesn't eliminate noise

the reduces outgoing noise, a value of 0 is documented as stopping noise but doesn't seem to work
client.heartbeat.outgoing = 1_000_000_000; 

this doesn't stop PONG messages
client.heartbeat.incoming = 1_000_000_000;

you can comment out line 258 of stomp.js to stop that noise (I don't want to disable all debug)
