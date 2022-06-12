
import '../App.css';

import React, { useEffect, useState, useRef } from 'react';
import { Client } from "paho-mqtt";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import EstateOverview from "./EstateOverview.js";

function Estate(props) {

  const [estateOverview, setEstateOverview] = useState(
    { "propertyGroups": [] }
  );

  const [graphTopic, setGraphTopic] = useState();

  const overviewTopic = props.estateName + "/Overview";
  const thermostatsTopic = props.estateName + "/online/thermostats";
  const oneThermostatTopic = props.estateName + "/thermostats";
  const msgClient = useRef(null);

  function handleThermostatSelected(thermostat) {
    console.log("thermostat selected:", thermostat)
    const topic = `${oneThermostatTopic}/${thermostat.groupId}/${thermostat.id}`;
    console.log(`topic: ${topic}`);
    setGraphTopic(topic);
  }

  useEffect(
    () => {
      if (graphTopic && msgClient.current) {
        msgClient.current.subscribe(graphTopic);
      }
    }
  )

  // manage connection and overview subscriptions
  useEffect(() => {

    if (msgClient.current != null) {
      // if already connected, nothing to do
      return;
    }
    msgClient.current = new Client("localhost", 61614, "estateMonitor");
    msgClient.current.onConnectionLost = (e) => onConnectionLost(e);
    msgClient.current.onMessageArrived = (m) => onMessageArrived(m);
    msgClient.current.connect({ onSuccess: () => onConnect() });

    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      msgClient.current.subscribe(overviewTopic);
      msgClient.current.subscribe(thermostatsTopic);
    }

    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }

    function onMessageArrived(message) {
      console.log("onMessageArrived:" + message.topic + ":");
      if (message.topic === overviewTopic) {
        // TODO - validate message
        let estateOverview = JSON.parse(message.payloadString);
        setEstateOverview(estateOverview);
      } else if (message.topic === "estate/online/thermostats") {
        //thisEstate.processThermostatStatus(message);
      } else {
        console.log("graphit: ", message);
        //thisEstate.processThermostatData(message);
      }
    }
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Estate Monitor - {props.estateName}
          </Typography>

        </Toolbar>
      </AppBar>
      <EstateOverview estateName={props.estateName} estateOverview={estateOverview} thermostatHandler={handleThermostatSelected} />
    </Box>
  );
}


export default Estate;
