import React from 'react';

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getInitialState() {
    return {username: 'username', password: 'password'};
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    // submit form handling
  }

  render() {
    return (
      <div>
        <section id="login-section">
          <h2>Login</h2>
          <form id="login-form" onSubmit={this.handleSubmit}>
            <label for="username">Username:</label>
            <input type="text" value={this.state.username} onChange={this.handleChange} />
            <br />
            <label for="password">Password:</label>
            <input type="text" value={this.state.password} onChange={this.handleChange} />
            <br />
            <input type="submit" value="Log In" />
          </form>
        </section>
      </div>
    );
  }
}
