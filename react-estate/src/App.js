
import './App.css';

var Stomp = require('stompjs');

function App() {
   var url = "ws://localhost:61614/stomp";
   var client = Stomp.client(url);

client.connect(function(sessionId) {
    client.subscribe(destination, function(body, headers) {
      console.log('This is the body of a message on the subscribed queue:', body);
    });

    client.publish(destination, 'Oh herrow');
}); 
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
