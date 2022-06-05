
import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';



import PropertyItem from "./PropertyItem.js";

function EstateOverview(props) {

  if (!props.estate) {
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
            {props.estate.estateName} Property Groups
        </ListSubheader>
        }
      >

        {props.estate.estateOverview.propertyGroups.map((group) => PropertyItem(group))}


      </List>
    </Box>
  );
}

export default EstateOverview