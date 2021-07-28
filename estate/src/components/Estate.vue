<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/estate.jpeg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>
    </v-row>
    <v-row color="primary">
      <v-col cols="12">
        <v-treeview
          dense
          activatable
          :items="propertyGroups"
          return-object
          @update:active="selectItem"
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon v-if="item.children">
              {{ open ? "mdi-folder-open" : "mdi-folder" }}
            </v-icon>
            <v-icon v-else>
              {{ item.online ? "mdi-thermometer" : "mdi-thermometer-off" }}
            </v-icon>
          </template>
        </v-treeview>
      </v-col>
    </v-row>
    <v-row color="grey">
      <v-col cols="12">
        <v-sparkline
          :value="thermostatSeries.values"
          :labels="thermostatSeries.labels"
          :gradient="thermostatGraphDef.gradient"
          :smooth="thermostatGraphDef.radius || false"
          :padding="thermostatGraphDef.padding"
          :line-width="thermostatGraphDef.width"
          :stroke-linecap="thermostatGraphDef.lineCap"
          :gradient-direction="thermostatGraphDef.gradientDirection"
          :fill="thermostatGraphDef.fill"
          :type="thermostatGraphDef.type"
          :auto-line-width="thermostatGraphDef.autoLineWidth"
          auto-draw
        ></v-sparkline>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Client } from "paho-mqtt";
let myClient;

// experiments for graph colours
const gradients = [
  ["#222"],
  ["#42b3f4"],
  ["red", "orange", "yellow"],
  ["purple", "violet"],
  ["#00c6ff", "#F0F", "#FF0"],
  ["#f72047", "#ffd200", "#1feaea"],
];

export default {
  name: "Estate",

  methods: {
    selectItem(item) {
      console.log("Selected ", item);
      myClient.subscribe("home/thermostats/hall");
    },
  },

  mounted() {
    // save "this" for use in Websocket callbacks
    const thisEstate = this;

    myClient = new Client("localhost", 61614, "estateMonitor");
    myClient.onConnectionLost = onConnectionLost;
    myClient.onMessageArrived = onMessageArrived;
    myClient.connect({ onSuccess: onConnect });

    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      myClient.subscribe("estate/Overview");
    }
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }

    function onMessageArrived(message) {
      console.log("onMessageArrived:" + message.topic);
      if (message.topic === "estate/Overview") {
        const payload = JSON.parse(message.payloadString);
        thisEstate.propertyGroups = payload.propertyGroups;
      } else {
        const payload = JSON.parse(message.payloadString);
        const formattedTime = new Date(payload.time).toLocaleString([], {
          hour: "numeric",
          minute: "numeric",
        });
        thisEstate.thermostatSeries.values.push(payload.temperature);
        thisEstate.thermostatSeries.labels.push(formattedTime);
        const newLength = Math.min(
          thisEstate.thermostatSeries.values.length,
          15
        );
        thisEstate.thermostatSeries.values.length = newLength;
        thisEstate.thermostatSeries.labels.length = newLength;
      }
    }
  },

  data: () => ({
    propertyGroups: [
      {
        id: 0,
        name: "Loading ...",
      },
    ],
    thermostatSeries: {
      labels: [],
      values: [],
    },
    thermostatGraphDef: {
      width: 2,
      radius: 10,
      padding: 8,
      lineCap: "round",
      gradient: gradients[5],
      labels: ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"],
      value: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0],
      gradientDirection: "top",
      gradients,
      fill: false,
      type: "trend",
      autoLineWidth: false,
    },
  }),
};
</script>
