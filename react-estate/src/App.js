
import './App.css';

var Stomp = require('stompjs');


function App() {
  var url = "ws://localhost:61614/stomp";
  var myClient = Stomp.client(url);
  myClient.debug = () => {};
  var overviewDestination = "/topic/estate.Overview";
  //var thermostatDestination = "estate.online.thermostats";

  // uncomment to reduce noise, comment out for normal running
  //myClient.heartbeat.outgoing = 1_000_000_000; 
   
  var headers = {
    'client-id': 'estateView'
  };

  myClient.reconnect_delay = 5000;
  myClient.connect( "", "", onConnect, onConnectError);

  function onConnectError(e) {
      console.log("onConnectError", e);
  }

  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    myClient.subscribe(overviewDestination, onOverview, { 'activemq.retroactive':'true' });
    //myClient.subscribe(thermostatDestination, onThermostatReading);
  }

  function onOverview(body, headers) {
    console.log('This is the body of a message on the overview queue:', body);
  }

  //function onThermostatReading(body, headers) {
  //  console.log('This is the body of a message on the thermostat queue:', body);
  //}

  return (
    <div className="App">
      <header className="App-header">

        <p>
          Estate goes here
        </p>

      </header>
    </div>
  );
}

export default App;
