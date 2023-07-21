window.onload = function(){
   const button = document.getElementById("subscribe");
   button.addEventListener("click", subscribeIfReady);
 }

let connected = false;
let client = new Paho.MQTT.Client("localhost", 61614, "clientId");
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect({onSuccess:onConnect});
let thermostatLocation;
let dataTopic;
let willTopic;

function subscribeIfReady(){
  let dataTopicBase = "home/thermostats/";
  let willTopicBase = "home/status/thermostats/";

  if ( ! connected){
    document.getElementById("status").textContent = "not connected, cannot subscribe";
      return;
  }

  thermostatLocation = document.getElementById("thermostatLocation").value;
  if ( ! thermostatLocation){
    document.getElementById("status").textContent = "not thermostatLocation, cannot subscribe";
       return;
  }

  dataTopic = dataTopicBase + thermostatLocation;
  client.subscribe(dataTopic);

  willTopic = willTopicBase + thermostatLocation;
  client.subscribe(willTopic);

  document.getElementById("status").textContent = `Subscribed to ${dataTopic} and ${willTopic}`
}



function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  //document.getElementById("status").textContent = "Connected"
  connected = true;
  subscribeIfReady();
};


function onConnectionLost(responseObject) {
  console.log("onConnectionLost");
  connected = false;
  document.getElementById("status").textContent = "Disconnected"
  if (responseObject.errorCode !== 0){
	    console.log("onConnectionLost:"+responseObject.errorMessage); 
  }
};

function onMessageArrived(message) {
  let topic = message.topic;

  if ( message.topic === willTopic){
    document.getElementById("status").textContent = message.payloadString;
    return;
  }

  if ( message.topic !== dataTopic){
      console.log("unexpected onMessageArrived: "+message.payloadString);
  }

  let reading = JSON.parse(message.payloadString);

 
};