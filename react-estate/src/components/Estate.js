
import '../App.css';
import EstateOverview from "./EstateOverview.js";

import React, { useEffect, useState } from 'react';
import { Client } from "paho-mqtt";

function Estate(props) {

  const [ estateOverview, setEstateOverview] = useState();

  useEffect(() => {

    const myClient = new Client("localhost", 61614, "estateMonitor");
    myClient.onConnectionLost = (e) => onConnectionLost(e);
    myClient.onMessageArrived = (m) => onMessageArrived(m);
    myClient.connect({ onSuccess: () => onConnect() });

    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      myClient.subscribe("estate/Overview");
      myClient.subscribe("estate/online/thermostats");
    }

    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }

    function onMessageArrived(message) {
      console.log("onMessageArrived:" + message.topic + ":");
      if (message.topic === "estate/Overview") {
        // TODO - validate message
        let estateOverview = JSON.parse(message.payloadString);
        setEstateOverview(estateOverview);
      } else if (message.topic === "estate/online/thermostats") {
        //thisEstate.processThermostatStatus(message);
      } else {
        //thisEstate.processThermostatData(message);
      }
    }
  });

  return (
    <div>
      <h1>Estate {props.estateName}</h1>
      <EstateOverview estateOverview={estateOverview} />
    </div>
  );
};


export default Estate;
