
import './App.css';

import { Client } from "paho-mqtt";
let myClient;

function App() {

  // save "this" for use in Websocket callbacks
  //const thisEstate = this;

  myClient = new Client("localhost", 61614, "estateMonitor");
  myClient.onConnectionLost = onConnectionLost;
  myClient.onMessageArrived = onMessageArrived;
  myClient.connect({ onSuccess: onConnect });

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
      //thisEstate.processEstateOverview(message);
    } else if (message.topic === "estate/online/thermostats") {
      //thisEstate.processThermostatStatus(message);
    } else {
      //thisEstate.processThermostatData(message);
    }
  }


  return (
    <div className="App">
      <header className="App-header">

        <p>
          Estate goes here
        </p>

      </header>
    </div>
  );
}

export default App;
