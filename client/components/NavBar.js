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
        <div className="row column">

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
        
          <button className="button" type="button" data-toggle="example-dropdown-1">Login</button>
          <div className="dropdown-pane dropdown" id="example-dropdown-1" data-dropdown data-auto-focus="true">
            <form onSubmit={this.handleSubmit}>
              <label htmlFor="username">Username:</label>
              <input type="text" value={this.state.username} onChange={this.handleUsernameChange} />
              <br />
              <label htmlFor="password">Password:</label>
              <input type="text" value={this.state.password} onChange={this.handlePasswordChange} />
              <br />
              <input type="submit" value="Log In" />
            </form>
          </div>
          
          <button className="button" type="button" data-toggle="example-dropdown-2">Signup</button>
          <div className="dropdown-pane dropdown" id="example-dropdown-2" data-dropdown data-auto-focus="true">
            <form onSubmit={this.handleSubmit}>
              <label htmlFor="username">Username:</label>
              <input type="text" value={this.state.username} onChange={this.handleUsernameChange} />
              <br />
              <label htmlFor="password">Password:</label>
              <input type="text" value={this.state.password} onChange={this.handlePasswordChange} />
              <br />
              <input type="submit" value="Sign Up" />
            </form>
          </div>

        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  changeChannel: React.PropTypes.func,
};
