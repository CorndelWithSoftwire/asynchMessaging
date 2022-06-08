

import React from 'react';

import Box from '@mui/material/Box';
import { VictoryPie } from "victory";

export default function PropertyGraph(props) {

    if (!props.graphData) {
        return;
    }

    return (

        <Box>
            <VictoryPie >
        
            </VictoryPie>
        </Box>

    )
}