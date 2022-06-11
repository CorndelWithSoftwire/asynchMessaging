

import React from 'react';

import Box from '@mui/material/Box';
import { VictoryContainer, VictoryChart, VictoryLine, VictoryTheme } from "victory";

export default function PropertyGraph(props) {

    if (!props.graphData || props.graphData.length < 1) {
        return;
    }

    const lineStyle = {
        data: { stroke: "#c43a31" },
        parent: { border: "1px solid #ccc" }
    };

    return (

       <Box style={
           { height: "400px", width: "750px"}
       }>

      
            <VictoryChart
                theme={VictoryTheme.material}
             
            >
                <VictoryLine
                    style={lineStyle}
                    data={props.graphData[0].data}
                />
            </VictoryChart>
            
    </Box>
       

    )
}