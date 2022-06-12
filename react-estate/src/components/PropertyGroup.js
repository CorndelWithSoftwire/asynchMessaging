
import React from 'react';

export default function PropertyGroup(props) {
    const [x, setX] = React.useState(false);
    return (
        <h2 key={props.name}>{props.name}</h2>
                
    );
}