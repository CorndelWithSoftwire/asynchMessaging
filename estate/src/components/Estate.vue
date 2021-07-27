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
            :items="propertyGroups"
            return-object @update:active="selectItem"
            >
        </v-treeview>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Client} from 'paho-mqtt';
let myClient;

export default {
  name: "Estate",

  methods: {
    selectItem(item) {
        console.log("Selected ", item);
    }

  },

  mounted(){
    // save "this" for use in Websocket callbacks
    const thisEstate = this;

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
      const payload = JSON.parse(message.payloadString);
      thisEstate.propertyGroups = payload.propertyGroups;
    }
  },

  data: () => ({
    propertyGroups: [
      {
        id: 0,
        name: "Loading ..."       
      }
    ],
  }),
};
</script>
