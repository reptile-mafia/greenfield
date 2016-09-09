import React from 'react';
import PlayerWindow from './PlayerWindow';
import MixtapePlayer from './MixtapePlayer';
import NavBar from './NavBar';
import Login from './Login';
import Signup from './Signup';
import AddVideo from './AddVideo';
import NavModel from '../models/navModel';
import VideoDescription from './videoDetails';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      background: '',
      videos: [],
      channel: '',
      channel_id: 'default',
      id: 0,
      showMixtape: false,
      signedin: false,
      channelInfo:[],
      videoUrl: '',
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
    this.setState({signedin: true, user: username});
  }

  declareSignedOut(){
    this.setState({signedin: false, user: ''});
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
      return (
        <MixtapePlayer onVideoChange={ (url) => {
          this.setState({ videoUrl: url });
          console.log('onVideoChange: ', url);
        }}/>
      );
    } else {
      return (
        <div>
          <PlayerWindow
            videos={this.state.videos}
            signedin={this.state.signedin}
            channel_id={this.state.channel_id}
            user_id="1"
            onVideoChange={ (url) => {
              this.setState({ videoUrl: url });
              console.log('onVideoChange: ', url);
            }}
            <AddVideo channelId={this.state.channel_id} />
          />
        </div>
      );
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
            user={this.state.user}
            changeChannel={ (channelId) => this.changeChannel(channelId)}
            declareSignedIn={(username) => this.declareSignedIn(username)}
            declareSignedOut={() => this.declareSignedOut()}
          />
        </header>
        <div className="container">
          <div className="row column">
            <h2>{ this.state.showMixtape ? 'mixtape' : this.state.channel }</h2>
            { this.renderVideo() }
            <VideoDescription url={ this.state.videoUrl } />
          </div>
        </div>
      </div>
    );
  }
}
