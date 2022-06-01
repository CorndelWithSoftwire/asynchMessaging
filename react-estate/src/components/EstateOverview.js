
import React, { Component } from 'react';

class EstateOverview extends Component {
    constructor(props) {
      super(props);
      this.state = {
      };
    }
  
    render() {
      if ( ! this.props.estateOverview ){
        return;
      }
      return (
        <div>
          <h2>Estate {this.props.estateOverview.propertyGroups[0].name}</h2>
        </div>
      );
    }
    
  }

  export default EstateOverview