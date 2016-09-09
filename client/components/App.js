import React from 'react';
import PlayerWindow from './PlayerWindow';
import MixtapePlayer from './MixtapePlayer';
import NavBar from './NavBar';
import Login from './Login';
import Signup from './Signup';
import NavModel from '../models/navModel';
// import $ from '../models/lib/jquery';

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
      showMixtape: false,
      signedin: false,
      channelInfo:[],
    };
    this.channelInfo = [];
  }

  componentWillMount(){
    NavModel.getChannelInfo()
    .then(channelInfo => {
      this.setState({
        channelInfo: channelInfo
      })
    });
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

  declareSignedIn(username){
    console.log("declaring signed in")
    this.setState({signedin: true, user: username});
  }

  changeChannel(channelId) {
    this.setState({ showMixtape: false });
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

  renderVideo() {
    if (this.state.showMixtape) {
      return <MixtapePlayer />;
    } else {
      return <PlayerWindow videos={this.state.videos} channel_id={this.state.channel_id} user_id="1" />
    }
  }

  render() {
    return (
      <div>
        <header>
          <NavBar
            channelInfo = {this.state.channelInfo}
            onMixtapeSelected={ () => {
                this.setState({ showMixtape: true })
              }
            }
            signedin={this.state.signedin}
            changeChannel={ (channelId) => this.changeChannel(channelId) }
            declareSignedIn={(username) => this.declareSignedIn(username)}
          />
        </header>

        <div className="container">
          <div className="row column">
            <h2>{ this.state.showMixtape ? 'mixtape' : this.state.channel }</h2>
            { this.renderVideo() }
          </div>
        </div>
      </div>
    );
  }
}
