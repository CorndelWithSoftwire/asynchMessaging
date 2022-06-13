
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
  const [subscribedGraphTopic, setSubscribedGraphTopic] = useState();
  const emptyGraphData = useRef([
    {
      id: 1,
      data: [
      ]
    }
  ]);
  const [graphData, setGraphData] = useState(emptyGraphData.current);

  const overviewTopic = props.estateName + "/Overview";
  const thermostatsTopic = props.estateName + "/online/thermostats";
  const oneThermostatTopic = props.estateName + "/thermostats";
  const msgClient = useRef(null);

  // callback function passed to components that may select a 
  // thermostat to be graphed. Currently only one thermostat is graphed at a time.
  function handleThermostatSelected(thermostat) {
    const topic = `${oneThermostatTopic}/${thermostat.groupId}/${thermostat.id}`;
    setGraphTopic(topic);
  }

  // add value to current graph
  function handleThermostatData(data) {

    if (!(data && data.payloadString)) {
      console.log("invalid data", data);
      return;
    }
    const payload = JSON.parse(data.payloadString);
    console.log("graphit: ", payload);

    setGraphData(prevGraphData => addToGraphData(prevGraphData));

    function addToGraphData(prevGraphData) {
      console.log("previous data: ", prevGraphData);
      let newGraph = { ...prevGraphData[0] };
      if (newGraph.data.length === 0) {
        newGraph.epoch = payload.time;
        newGraph.data = [{ x: 0, y: payload.temperature }];
      } else {
        newGraph.data = [...newGraph.data, { x: payload.time - newGraph.epoch, y: payload.temperature }];
      }

      const updatedGraphData = [newGraph];
      return updatedGraphData;
    }
  }

  // subscribe (only if new topic selected)
  useEffect(
    () => {
      if (graphTopic && msgClient.current) {
        // remove any previous subscription
        if (subscribedGraphTopic) {
          msgClient.current.unsubscribe(subscribedGraphTopic);
          console.log("unsubscribed from ", subscribedGraphTopic);
          // clear graph
          setGraphData(emptyGraphData.current);
        }
        msgClient.current.subscribe(graphTopic);
        // record subscription so that we can unsubscribe
        setSubscribedGraphTopic(graphTopic);
        console.log("subscribed to ", graphTopic);
      }
    }, [graphTopic, subscribedGraphTopic, emptyGraphData] // only when topic changes
                    // array needs to have all referenced items even though only expect topic to change
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
        handleThermostatData(message);
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
      <EstateOverview estateName={props.estateName}
        estateOverview={estateOverview}
        thermostatHandler={handleThermostatSelected}
        graphData={graphData} />
    </Box>
  );
}


export default Estate;
