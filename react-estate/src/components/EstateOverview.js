
import React from 'react';

function EstateOverview(props) {
  
    if (!props.estateOverview) {
        return;
    }
    return (
        <div>
            <h2>Estate {props.estateOverview.propertyGroups[0].name}</h2>
        </div>
    );
}

export default EstateOverview