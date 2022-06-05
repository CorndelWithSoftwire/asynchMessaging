
import './App.css';
import Estate from "./components/Estate.js";

import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';

function App() {

  return (
    <React.Fragment>
     <CssBaseline />
    <div className="App">
      <header className="App-header">

        <Estate estateName="estate"></Estate>

      </header>
    </div>
    </React.Fragment>
  );
}

export default App;
