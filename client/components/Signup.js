import React from 'react';
import NavBar from './NavBar';

export default class SignupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '', 
      password: '',
      responseMessage: null,
      errorMessage: null
    };

    this.handleUsernameChange= this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  handleUsernameChange(event) {
    this.setState({username: event.target.value});
  }

  handlePasswordChange(event) {
    this.setState({password: event.target.value});
  }

  attemptSignup(userdata){
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/signup",
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      "data": JSON.stringify(userdata)
    }

    $.ajax(settings)
    .done( (response) => {
      var username = this.state.username;
      this.props.declareSignedIn(username);
      console.log("attemptSignup response: ", response);
    })
    .fail( (response) => {
      var messageObject = response.responseText;
      this.setState({ errorMessage: messageObject });

    });
  }

  handleSubmit() {
    let user = this.state.username;
    let pass = this.state.password;
    this.attemptSignup({'username': user, 'password': pass});
  }

  render() {
    return (
      <span>
      <button className="logsub" type="button" data-toggle="signup-dropdown">Signup</button>
      <div className="dropdown-pane dropdown" id="signup-dropdown" data-dropdown data-auto-focus="true">   
        <div>
          <a className="button ppfa" href="/login-facebook"><i className="fa fa-facebook" /> Login with Facebook</a>
          <h5 className="orline">&mdash; OR &mdash;</h5>
          <form>
            <label htmlFor="username">Username:</label>
            <input type="text" placeholder="username" onChange={this.handleUsernameChange} />
            <label htmlFor="password">Password:</label>
            <input type="password" placeholder="password" onChange={this.handlePasswordChange} />
            <button type="button" className="submit-dd" onClick={this.handleSubmit} >Signup</button>
          </form>
          <p className="errorMessage"> { this.state.errorMessage ? this.state.errorMessage : null } </p>
        </div>
      </div>
      </span>
    );
  }
}
