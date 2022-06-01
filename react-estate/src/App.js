
import './App.css';

import React, { Component } from 'react';
import { Client } from "paho-mqtt";


function App() {

  // save "this" for use in Websocket callbacks
  //const thisEstate = this;



 


  return (
    <div className="App">
      <header className="App-header">

        <Estate estateName="Big Estate"></Estate>

      </header>
    </div>
  );
}



class Estate extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
        <h1>Estate {this.props.estateName}</h1>
        {this.state.estateOverview && <h2>Estate {this.state.estateOverview.propertyGroups[0].name}</h2>}
      </div>
    );
  }

  componentDidMount() {
    this.myClient = new Client("localhost", 61614, "estateMonitor");
    this.myClient.onConnectionLost = (e) => this.onConnectionLost(e);
    this.myClient.onMessageArrived = (m) => this.onMessageArrived(m);
    this.myClient.connect({ onSuccess: () => this.onConnect() });
  }

  componentWillUnmount() {
  }

  onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    this.myClient.subscribe("estate/Overview");
    this.myClient.subscribe("estate/online/thermostats");
  }

  onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0)
      console.log("onConnectionLost:" + responseObject.errorMessage);
  }

  onMessageArrived(message) {
    console.log("onMessageArrived:" + message.topic + ":");
    if (message.topic === "estate/Overview") {
      // TODO - validate message
      let estateOverview = JSON.parse(message.payloadString);
      this.setState({ "estateOverview":estateOverview});
    } else if (message.topic === "estate/online/thermostats") {
      //thisEstate.processThermostatStatus(message);
    } else {
      //thisEstate.processThermostatData(message);
    }
  }
}

export default App;
