
import React from 'react';

import Box from '@mui/material/Box';

import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';



import PropertyGroup from "./PropertyGroup.js";
import PropertyGraph from './PropertyGraph.js';

function EstateOverview(props) {


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

        {props.estateOverview.propertyGroups.map((group) => PropertyGroup(group))}


      </List>
      <PropertyGraph>
        
      </PropertyGraph>

      
    </Box>
  );
}

export default EstateOverview