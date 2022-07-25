# Estate implemented using REACT

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Description

This application uses WebSockets to subscribe to overview information about the
Estate. It presents a list of preperties. Clicking on a preoperty subscribes
to telemetry for that property.


# Launching

Use separate terminals to

Start active MQ: activemq start
Run the home monitor which will publish the overview: node homeMonitor.js 20 30

Then run several more terminals to start individual thermostats, specify group, property
and a name

      node thermostat 1 1 "The Oaks"
      node thermostat 1 2 "Aspens"
      node thermostat 2 1 "Astoria"

Then launch the react application from react-estate directory

    npm install
    npm start

This should launch the web app and display in your browser
#
