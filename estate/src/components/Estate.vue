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
          :active="activeItems"
          :items="propertyGroups"
          return-object
          @update:active="selectItem"
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon v-if="item.children" color="blue darken-2">
              {{ open ? "mdi-folder-open" : "mdi-folder" }}
            </v-icon>
            <v-icon v-else v-bind:color="item.online ? 'green' : 'red'">
              {{ item.online ? "mdi-thermometer" : "mdi-thermometer-off" }}
            </v-icon>
          </template>
        </v-treeview>
      </v-col>
    </v-row>
    <v-row color="grey">
      <v-col cols="12">
        <v-card class="flex" flat tile>
          <v-card-title class="blue darken-2">
            <strong class="subheading"
              >{{thermostatSeries.propertyName}} {{ thermostatSeries.groupName}} {{thermostatSeries.latest}}</strong
            >
            <v-spacer></v-spacer>
          </v-card-title>
        </v-card>
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
    makeThermostatDataTopic(groupId, propertyId) {
      return "estate/thermostats/" + groupId + "/" + propertyId;
    },
    selectItem(item) {
      console.log("Selected ", item);
      const groupId = item[0].groupId;
      if (!groupId) {
        // not selecting a property
        return;
      }
      const propertyId = item[0].propertyId;
      if (
        this.thermostatSeries.groupId >= 0 &&
        this.thermostatSeries.propertyId >= 0
      ) {
        myClient.unsubscribe(
          this.makeThermostatDataTopic(
            this.thermostatSeries.groupId,
            this.thermostatSeries.propertyId
          ),
          e => console.log("Unsubscribe error: ", e)
        );
        // new selection, clear graph
        this.thermostatSeries.values.length = 0;
        this.thermostatSeries.labels.length = 0;
      }
      myClient.subscribe(this.makeThermostatDataTopic(groupId, propertyId));
      this.thermostatSeries.groupId = groupId;
      this.thermostatSeries.groupName = item[0].groupName;
      this.thermostatSeries.propertyId = propertyId;
      this.thermostatSeries.propertyName = item[0].name;
    },
    processThermostatStatus(message) {
      const payload = JSON.parse(message.payloadString);
      console.log(payload);
      const group = this.propertyGroups.find((e) => {
        return e.groupId === payload.groupId;
      });
      if (!group) {
        console.log("unexpected group " + payload.groupId);
        return;
      }
      const propertyIndex = group.children.findIndex((e) => {
        return e.propertyId === payload.id;
      });
      if (propertyIndex >= 0) {
        // easiest with Vue reactive arrays: replace entire item
        const property = Object.assign({}, group.children[propertyIndex]);
        property.online = payload.online;
        // Vue helper for replacing array item
        this.$set(group.children, propertyIndex, property);
        console.log("groups after property update", this.propertyGroups);
      }
    },
    processThermostatData(message) {
      const payload = JSON.parse(message.payloadString);
      const formattedTime = new Date(payload.time).toLocaleString([], {
        hour: "numeric",
        minute: "numeric"
      });
      this.thermostatSeries.values.push(payload.temperature);
      this.thermostatSeries.latest = payload.temperature
      this.thermostatSeries.labels.push(formattedTime);
      const newLength = Math.min(this.thermostatSeries.values.length, 15);
      this.thermostatSeries.values.length = newLength;
      this.thermostatSeries.labels.length = newLength;
    },
    processEstateOverview(message) {
      const payload = JSON.parse(message.payloadString);
      // denormalise so that complete id of selected item is easier to get
      
      // generate unique property ids
      let uniqueId =  payload.propertyGroups.length ; 
      payload.propertyGroups.forEach((group, gindex) => {
        group.groupId = group.id;
        group.id = gindex; // getting odd behaviour investigating if order of is matters
        group.children.forEach((property) => {
          property.propertyId = property.id;
          property.id = uniqueId++;
          property.groupId = group.groupId;
          property.groupName = group.name;
        });
        
      });
      this.propertyGroups = payload.propertyGroups;
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
      myClient.subscribe("estate/online/thermostats");
    }
    function onConnectionLost(responseObject) {
      if (responseObject.errorCode !== 0)
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }

    function onMessageArrived(message) {
      console.log("onMessageArrived:" + message.topic + ":");
      if (message.topic === "estate/Overview") {
        thisEstate.processEstateOverview(message);
      } else if (message.topic === "estate/online/thermostats") {
        thisEstate.processThermostatStatus(message);
      } else {
        thisEstate.processThermostatData(message);
      }
    }
  },

  data: () => ({
    // diplay in tree, start with fake item
    propertyGroups: [
      {
        id: 0,
        name: "Loading ...",
      },
    ],
    activeItems : [],
    // display in graphe
    thermostatSeries: {
      groupId: -1,
      groupName : "",
      propertyId: -1,
      propertyName: "",
      latest: "",
      labels: [],
      values: [],
    },
    // presentation style for graph
    thermostatGraphDef: {
      width: 2,
      radius: 10,
      padding: 8,
      lineCap: "round",
      gradient: gradients[5],
      labels: [],
      'label-size': 5,
      value: [],
      gradientDirection: "top",
      gradients,
      fill: false,
      type: "trend",
      autoLineWidth: false,
    },
  }),
};
</script>
