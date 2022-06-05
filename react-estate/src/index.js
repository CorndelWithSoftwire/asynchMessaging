import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
//import Demo from './demo';
import Estate from './components/Estate'

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <Estate estateName="SunnyVista" />
    </StyledEngineProvider>
  </React.StrictMode>
);