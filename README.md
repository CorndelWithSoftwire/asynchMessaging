# asynchMessaging
Messaging and asynchronous communication patterns. 

Examples using MQTT, command line scripts and JavaScript.

This is a solution to the Home Monitor example. 
To run it you need:

## the Vue app: 
    npm run serve
then click link to open in browser

## the home monitor: 

    node homeMontor.js threshold duration 
    
for example 

     homeMontor.js 65 1000

tweak these values to control problem detection

## some thermostats

Start several with different group and property ids.

    node thermostat.js 1 2 dave


