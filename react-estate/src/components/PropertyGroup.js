
import React from 'react';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
//import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
//import StarBorder from '@mui/icons-material/StarBorder';

import Box from '@mui/material/Box';

import PropertyItem from "./PropertyItem.js";

function PropertyGroup(props) {

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    if (!props.name) {
        return;
    }

    return (
        <Box key={props.name} >
        <ListItemButton  onClick={handleClick}>
                <ListItemIcon >
                    <InboxIcon />
                </ListItemIcon>
                <ListItemText  primary={props.name} />
                {open ? <ExpandLess /> : <ExpandMore  />}
            </ListItemButton>
           
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List  component="div" disablePadding>
                     {props.children.map((group) => PropertyItem(group))}
                </List>
            </Collapse>

        </Box>

      

    );
}

export default PropertyGroup;