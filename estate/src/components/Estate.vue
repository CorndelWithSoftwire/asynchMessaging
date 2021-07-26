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
        <v-treeview :items="propertyGroups"></v-treeview>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Client} from 'paho-mqtt';
let myClient;
export default {
  name: "Estate",

  mounted: () => {
    console.log("Subscribe here");
    //const myClient = window.client;
    myClient = new Client("localhost", 61614, "estateMonitor");
    myClient.onConnectionLost = onConnectionLost;
    myClient.onMessageArrived = onMessageArrived;
    myClient.connect({ onSuccess: onConnect });

    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      myClient.subscribe("estate/Info");
    }
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
    function onMessageArrived(message) {
      console.log("onMessageArrived:" + message.payloadString);
    }
  },

  data: () => ({
    propertyGroups: [
      {
        id: 1,
        name: "The Avenue",
        children: [
          {
            id: 101,
            name: "Beech",
            online: true,
            alerts: [],
          },
          {
            id: 103,
            name: "Oak",
            online: false,
            alerts: [],
          },
        ],
      },
      {
        id: 2,
        name: "Broadway",
        children: [
          {
            id: 201,
            name: "Astoria",
            online: true,
            alerts: [{ time: 0, text: "Below Threshold" }],
          },
        ],
      },
    ],
  }),
};
</script>
