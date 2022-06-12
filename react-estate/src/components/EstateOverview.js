
import React from 'react';
import List from '@mui/material/List';
import PropertyGroup from "./PropertyGroup.js";

export default function EstateOverview(props) {
 
  return ( 
      <List>
        {props.estateOverview.propertyGroups.map((group) => <PropertyGroup {...group} />)}
      </List>
  );
}
