
import '../App.css';

import React, { useEffect, useState } from 'react';
import EstateOverview from "./EstateOverview.js";

export default function Estate(props) {

  const [estateOverview, setEstateOverview] = useState( 
         { "propertyGroups" : [
          { name: "The Close"}
        ] }
      );

  useEffect(() => {

    const newEstateOverview =  {  
      propertyGroups: [
        { name: "The Avenue"},
        { name: "Broadway" }
      ]
    };
    // represents new data arriving asynchronously
    setTimeout(() => {
         setEstateOverview(newEstateOverview);
     }, 1000 );


  });

  return (   
      <EstateOverview estateName={props.estateName}  estateOverview={estateOverview} />  
  );
}



