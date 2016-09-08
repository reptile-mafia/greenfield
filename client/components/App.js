import React from 'react';
import PlayerWindow from './PlayerWindow';
import NavBar from './NavBar';
import Login from './Login';
import Signup from './Signup';
import NavModel from '../models/navModel';
import $ from '../models/lib/jquery';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: 'Joe',
      background: '',
      videos: [],
      channel: '',
      channel_id: 'default',
      id: 0,
    };
  }

  componentDidMount() {
    NavModel.changeChannel(this.state.channel_id)
    .then(channelObj => {
      this.setState({
        background: channelObj.background,
        videos: channelObj.videos,
        channel: channelObj.name,
      });
      $('body').css('background-image', `url(${this.state.background})`);
    });
  }

  changeChannel(channelId) {
    NavModel.changeChannel(channelId)
    .then(channelObj => {
      this.setState({
        background: channelObj.background,
        videos: channelObj.videos,
        channel: channelObj.name,
        channel_id: channelId,
      });
      $('body').css('background-image', `url(${this.state.background})`);
    });
  }

  render() {
    return (
      <div>
        <header>
          <NavBar changeChannel={(channelId) => this.changeChannel(channelId)} />
        </header>

        <div className="container">
          <div className="row column">
            <h2>{this.state.channel}</h2>
            <PlayerWindow videos={this.state.videos} channel_id={this.state.channel_id} user_id="1" />
          </div>
        </div>
      </div>
    );
  }
}
