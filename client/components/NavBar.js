import React from 'react';

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
      <ul className="dropdown menu align-right" data-dropdown-menu>
        <li><a href="#">Mixtape</a></li>
        <li className="is-dropdown-submenu-parent">
          <a>Channels</a>
          <ul className="menu">
            <li value="1" onClick={(e) => this.handleChange(e.currentTarget.value)}><a>Land</a></li>
            <li value="2" onClick={(e) => this.handleChange(e.currentTarget.value)}><a>Sea</a></li>
            <li value="3" onClick={(e) => this.handleChange(e.currentTarget.value)}><a>Air</a></li>
          </ul>
        </li>
        <li value="'default'" onClick={(e) => this.handleChange(e.currentTarget.value)}>
          <h1><a>CAT TANK</a></h1>
        </li>
      </ul>
    );
  }
}

NavBar.propTypes = {
  changeChannel: React.PropTypes.func,
};
