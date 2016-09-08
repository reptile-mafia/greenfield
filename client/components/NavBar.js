import React from 'react';
import Login from './Login';
import Signup from './Signup';

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: 'RubberDucky',
    };
  }

  componentDidMount() {
    $('.dropdown').foundation();
  }

  handleChange(value) {
    this.props.changeChannel(value);
  }

  render() {
    return (
      <div className="container">
        <div className="row">
        <div className="medium-6 columns">

          <ul className="dropdown menu align-left" data-dropdown-menu>
            <li value="'default'" onClick={(e) => this.handleChange(e.currentTarget.value)}>
              <h2 id="site_title"><a>CAT TANK</a></h2>
            </li>
            <li className="is-dropdown-submenu-parent">
              <a>Channels</a>
              <ul className="menu">
                <li value="1" onClick={(e) => this.handleChange(e.currentTarget.value)}><a>Land</a></li>
                <li value="2" onClick={(e) => this.handleChange(e.currentTarget.value)}><a>Sea</a></li>
                <li value="3" onClick={(e) => this.handleChange(e.currentTarget.value)}><a>Air</a></li>
              </ul>
            </li>
            <li><a href="#">Mixtape</a></li>
          </ul>

        </div>
        <div className="medium-6 columns" id="logsign-buttons">
        
          <button className="button" type="button" data-toggle="login-dropdown">Login</button>
          <div className="dropdown-pane dropdown" id="login-dropdown" data-dropdown data-auto-focus="true">
          <Login />
          </div>
          
          <button className="button" type="button" data-toggle="signup-dropdown">Signup</button>
          <div className="dropdown-pane dropdown" id="signup-dropdown" data-dropdown data-auto-focus="true">
          <Signup />
          </div>

        </div>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  changeChannel: React.PropTypes.func,
};
