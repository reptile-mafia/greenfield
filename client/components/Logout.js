import React from 'react';
import NavBar from './NavBar';

export default class LogoutPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  sendLogout(){
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/logout",
      "method": "GET",
      "headers": {
        "content-type": "application/json"
      }
    };

    $.ajax(settings)
    .done( (response) => {
      console.log("done response:", response);
    })
    .fail( (response) => {
      console.log("fail response:", response);
    });
  }

  handleLogout() {
    this.props.declareSignedOut();
    this.sendLogout();
  }

  render() {
    return (
      <span>
        <span id="loggedInAs">Mraow, {this.props.user}!</span>
        <button className="button" type="button" onClick={this.handleLogout} >Logout</button>
      </span>
    );
  }
}
