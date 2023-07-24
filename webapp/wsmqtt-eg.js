
// Plumbing 

// 1. application connections to the data sources
let client = new Paho.MQTT.Client("localhost", 61614,"123");
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.connect(
    {
      onSuccess: onConnect,
      cleanSession : false
    }
    );

// 2. application responding to the user 
window.onload = function(){
   domReady = true;
   const button = document.getElementById("subscribe");
   button.addEventListener("click", subscribeIfReady);
 }

 // application state - data shared by application functions
let domReady = false;
let connected = false;
let subscribed = false;
let thermostatLocation;
let dataTopic;
let willTopic;
let QOS = 1;

// Application implementation

// subscription 
function subscribeIfReady(){
  let dataTopicBase = "home/thermostats/";
  let willTopicBase = "home/status/thermostats/";

  if ( ! domReady){
    // dom not loaded, so cannot display status or get location
    return
  }

  if ( ! connected){
    document.getElementById("status").textContent = "not connected, cannot subscribe";
    return;
  }

  if (subscribed ){ 
    // previously have subscribed, so we have previous topics
    client.unsubscribe(dataTopic);
    client.unsubscribe(willTopic);
  }

  thermostatLocation = document.getElementById("location").value;
  if ( ! thermostatLocation){
  
    document.getElementById("status").textContent = "no requested location, cannot subscribe";
    return;
  }

  dataTopic = dataTopicBase + thermostatLocation;
  client.subscribe(dataTopic, { 
      qos: QOS,
  });

  willTopic = willTopicBase + thermostatLocation;
  client.subscribe(willTopic, { qos: QOS});

  subscribed = true;

  document.getElementById("status").textContent = `Subscribed to ${dataTopic} and ${willTopic}`
}


// when connected or reconnected adjust connected flag and status
// and attempt subscription
function onConnect() {
  console.log("onConnect");
  if ( domReady){
      document.getElementById("status").textContent = "Connected"
  }
  connected = true;
  subscribeIfReady();
};

// when disconnected adjust connected flag and status
function onConnectionLost(responseObject) {
  console.log("onConnectionLost");
  connected = false;
  document.getElementById("status").textContent = "Disconnected"
  if (responseObject.errorCode !== 0){
	    console.log("onConnectionLost:"+responseObject.errorMessage); 
  }
};

// all messages delivered here, we may have multiple suscriptions
// so may receive several different kinds of messages, each on
// theor own topic
function onMessageArrived(message) {
  console.log("onMessageArrived");
  let topic = message.topic;

  if ( message.topic === willTopic){
    document.getElementById("status").textContent = "Status message: " + message.payloadString;
    return;
  }

  if ( message.topic !== dataTopic){
      console.log("unexpected onMessageArrived: "+message.payloadString);
      return;
  }

  let reading = JSON.parse(message.payloadString);

  displayReading(reading, message.retained);

};


// format the reading information and display it
function displayReading(reading, retained){

  if ( ! domReady){
    // dom not loaded, so cannot display 
    return
  }

  let tableRef = document.getElementById("readingTable");

  if ( ! tableRef ){
      console.log("No display table");
      return;
  }
  // insert at end
  let newRow = tableRef.insertRow(-1);

  // simple format, hh:mm:ss
  let dateTime = new Date(reading.time);
  let dateTimeString = `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;
  let timeText = document.createTextNode(dateTimeString);

  let timeCell = newRow.insertCell(0);
  timeCell.appendChild(timeText);

  
  let displayTemperature = reading.temperature;
  if ( retained ){
    displayTemperature += " ***"
  }
  let temperatureText = document.createTextNode(displayTemperature);

  let temperatureCell = newRow.insertCell(1);
  temperatureCell.appendChild(temperatureText);

  if ( tableRef.rows.length > 10 ){
    tableRef.deleteRow(0);
  }

}