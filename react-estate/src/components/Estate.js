
import '../App.css';

import React, { useEffect, useState } from 'react';
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
         { "propertyGroups" : [] }
      );
  
  const overviewTopic = props.estateName + "/Overview";
  const thermostatsTopic = props.estateName + "/online/thermostats";

  useEffect(() => {

    const myClient = new Client("localhost", 61614, "estateMonitor");
    myClient.onConnectionLost = (e) => onConnectionLost(e);
    myClient.onMessageArrived = (m) => onMessageArrived(m);
    myClient.connect({ onSuccess: () => onConnect() });

    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      myClient.subscribe(overviewTopic);
      myClient.subscribe(thermostatsTopic);
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
      <EstateOverview estateName={props.estateName}  estateOverview={estateOverview} />
    </Box>
  );
}


export default Estate;
