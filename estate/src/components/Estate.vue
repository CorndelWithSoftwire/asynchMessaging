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
         <v-card class="flex" flat tile>
          <v-card-title class="blue darken-2">
            <strong class="subheading"
              >Replace with an overview of Estate {{estateName}}</strong
            >
            <v-spacer></v-spacer>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row color="grey">
      <v-col cols="12">
        <v-card class="flex" flat tile>
          <v-card-title class="blue darken-2">
            <strong class="subheading"
              >Replace with summary of selected Property</strong
            >
            <v-spacer></v-spacer>
           
          </v-card-title>
           <strong class="subheading"
              >Replace with a representation of live or historic Telemetry</strong>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Client } from "paho-mqtt";
let myClient;

export default {
  name: "Estate",

  methods: {
    // Methods to process each different message type
    processXxx(message) {
      const payload = JSON.parse(message.payloadString);
      console.log("Xxx payload", payload);
      this.estateName = "Name from payload";
      // extract data from payload and add into model

      // Note: when updating data in an item in an array, replace
      // the whole item using the Vue $set utility function
      // which will trigger reactive behavious
      // this.$set(someArray, anIndex, newItem);

    }
   
  },

  mounted() {
    // save "this" for use in Websocket callbacks
    const thisEstate = this;

    // connect over websockets (need to make a unique client id if using more than one browser)
    myClient = new Client("localhost", 61614, "estateMonitor");
    myClient.onConnectionLost = onConnectionLost;
    myClient.onMessageArrived = onMessageArrived;
    myClient.connect({ onSuccess: onConnect });

    function onConnect() {
      // Once a connection has been made, make a subscription and send a message.
      console.log("onConnect");
      myClient.subscribe("some/topic");
      myClient.subscribe("some/different/topic");
     
    }
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }

    function onMessageArrived(message) {
      console.log("onMessageArrived:" + message.topic + ":");
      if (message.topic === "some/topic") {
        thisEstate.processXyy(message);
      } else if (message.topic === "some/different/topic") {
        // adjust to call suitable method
        // thisEstate.processYyy(message);
      } else {
        // adjust to call suitable method
        // thisEstate.processZzz(message);
      }
    }
  },

  data: () => ({
    // predefine the model, so that Vue makes it reactive
    // For each subscribed message define a structure for the
    // data you will refer to in the UX; set up the structure
    // to suit the Vue components you will use and where 
    // needed transform the data received in the message to
    // fit this structure.
    estateName : "unknown",
    someEstateData: [
      {
        id: 0,
        name: "Loading ...",
      },
    ],
  
  }),
};
</script>
