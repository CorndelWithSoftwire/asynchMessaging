
import React from 'react';

import Box from '@mui/material/Box';

import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';



import PropertyGroup from "./PropertyGroup.js";
import PropertyGraph from './PropertyGraph.js';
import { FormGroup } from '@mui/material';

function EstateOverview(props) {

  const [graphData, setGraphData] = React.useState([]);

  const oneGraph = {
    id: 1,
    data: [
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 7 },
      { x: 10, y: 8 }
    ]
  };
const exampleGraphData = [oneGraph]

  if (!props.estateOverview || !props.estateName) {
    return;
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper' }}>


      <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            {props.estateName} Property Groups
        </ListSubheader>
        }
      >

        {props.estateOverview.propertyGroups.map(
          (group) => 
            
              <PropertyGroup thermostatHandler={props.thermostatHandler} key={group.id} {...group} />
            
          
        )}


      </List>
      <PropertyGraph graphData={graphData} />

    </Box>
  );
}

export default EstateOverview