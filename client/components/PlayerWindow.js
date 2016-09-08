import React from 'react';
import YouTube from 'react-youtube';
import { sendLike, Moment, getMoreVideos } from '../models/videoModel.js';




export default class PlayerWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: 'RubberDucky',
      currentVideo: '',
      videoList: [],
      seek: false,
      totalTime: 0,
      offset: 0,
      momentList: [],
      extreme: false,
      extremeStart: 0,
      extremeStop: 0,
      channel_id: 0,
    };

    // references to dom elements
    this.player = '';
    this.controls = '';
    this.playHead = '';
    this.timeline = '';
    this.extremeClip = '';

    // you have to manually bind methods
    this.handleEnd = this.handleEnd.bind(this);
    this.handleReadyState = this.handleReadyState.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleExtreme = this.handleExtreme.bind(this);
    this.handleLame = this.handleLame.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {

    this.playHead = document.getElementById('playHead');
    this.timeline = document.getElementById('timeline');
    this.controls = document.getElementById('playerControls');
  }

  componentDidUpdate() {

    if (this.props.channel_id !== this.state.channel_id) {
      this.updateVideoList(this.props.videos);
    }
  }

  // new videos are added if video list reaches a specific length
  checkVideoListLength(list) {
    return new Promise((resolve, reject) => {
      if (list.length < 3) {
        getMoreVideos(this.props.channel_id)
        .then(videos => {
          const videosArray = list.concat(videos);
          resolve(videosArray);
        });
      } else {
        reject(list);
      }
    });
  }

  // remove current video from list and update state
  updateVideoList(list) {
    const updatedList = list || this.state.videoList;
    this.checkVideoListLength(updatedList)
    .then(videos => {
      let video = videos.shift();
      this.setState({
        currentVideo: video,
        videoList: videos,
        channel_id: this.props.channel_id,
      });
      // Fire video change callback
      this.props.onVideoChange(video.url);
    })
    .catch(() => {
      let video = updatedList.shift();
      this.setState({
        currentVideo: video,
        videoList: updatedList,
        channel_id: this.props.channel_id,
      });
      // Fire video change callback
      this.props.onVideoChange(video.url);
    });
  }

  // ended state from API
  handleEnd() {
    this.setState({
      momentList: [],
    });

    this.updateVideoList();
  }

  // ready state from player API
  handleReadyState(event) {
    this.player = event.target;

    if (this.state.currentVideo) {
      // player state
      // 1 – unstarted
      // 0 – ended
      // 1 – playing
      // 2 – paused
      // 3 – buffering
      // 5 – video cued

      if (this.player.getPlayerState() !== 2 && this.player.getPlayerState() !== 1) {
        event.target.playVideo();
        event.target.mute();
      }

      this.setState({
        totalTime: event.target.getDuration(),
      });

      $('#moments').html('');

      if (this.state.currentVideo.time_based_likes.length) {
        this.state.currentVideo.time_based_likes.forEach(moment => {
          const newMoment = new Moment($('<div>').html(''), moment, this.player, this.props.user_id);
          const mWidth = (moment.stop_time - moment.start_time) / this.state.totalTime;
          const mLeft = moment.start_time / this.state.totalTime;
          $('#moments').append(newMoment.render);
          this.state.momentList.push(newMoment);
          newMoment.render.addClass('moment');
          newMoment.render.css({
            left: `${mLeft * 100}%`,
            width: `${mWidth * 100}%`,
          });
        });
      }
    }
  }

  // create a new highlight in currently playing video
  handleExtreme(e) {
    if (!this.state.extreme) {
      this.setState({ extreme: true });
      e.target.classList.add('alert');

      if (!this.state.extremeStart) {
        this.setState({
          extremeStart: this.player.getCurrentTime(),
        });

        this.extremeClip = $('<div/>').addClass('moment').addClass('extreme');
        $('#moments').append(this.extremeClip);
      }
    } else {
      this.setState({
        extreme: false,
        extremeStop: this.player.getCurrentTime(),
      });
      e.target.classList.remove('alert');
      const newLike = {};
      const endTime = this.player.getCurrentTime();

      newLike.start_time = Math.ceil(this.state.extremeStart - 1);
      newLike.stop_time = Math.ceil(endTime);
      newLike.user_id = this.props.user_id;
      newLike.video_id = this.state.currentVideo.id;
      newLike.channel_id = this.state.currentVideo.channel_id;
      sendLike(newLike)
        .then((resp) => {
          const newMoment = new Moment($('<div>').html(''), resp, this.player, this.props.user_id);
          const mWidth = (resp.stop_time - resp.start_time) / this.state.totalTime;
          const mLeft = resp.start_time / this.state.totalTime;
          $('#moments .extreme').hide();
          $('#moments').append(newMoment.render);
          this.state.momentList.concat(newMoment);
          newMoment.render.addClass('moment');
          newMoment.render.css({
            left: `${mLeft * 100}%`,
            width: `${mWidth * 100}%`,
          });
          this.setState({
            extremeStart: 0,
            extremenStop: 0,
          });
        });
    }
  }

  // skip to next video
  handleLame() {
    this.player.seekTo(this.player.getDuration());
  }

  // respond to video state from youtube player API
  handleStateChange(event) {
    this.setState({
      totalTime: event.target.getDuration(),
    });

    if (event.target.getPlayerState() === 1) {
      window.setInterval(() => {
        const percent = (event.target.getCurrentTime() / this.state.totalTime) * 100;
        const totalMinutes = (`${Math.floor(this.state.totalTime / 60)}`);
        const totalSeconds = (`0${Math.floor(this.state.totalTime % 60)}`).slice(-2);
        const currentMinutes = (`${Math.floor(event.target.getCurrentTime() / 60)}`);
        const currentSeconds = (`0${Math.floor(event.target.getCurrentTime() % 60)}`).slice(-2);

        $('#timeElapsed').html(`${currentMinutes}:${currentSeconds}`);
        $('#totalTime').html(`${totalMinutes}:${totalSeconds}`);
        $('#percentageComplete').html(`${Math.ceil(percent)}%`);

        this.state.momentList.forEach(moment => {
          moment.hitTest(event.target.getCurrentTime());
        });

        if (this.extremeClip) {
          const clipEnd = this.state.extremeStop || this.player.getCurrentTime();
          const clipWidth = (clipEnd - this.state.extremeStart) / this.state.totalTime;
          const clipLeft = this.state.extremeStart / this.state.totalTime;
          this.extremeClip.css({
            left: `${clipLeft * 100}%`,
            width: `${clipWidth * 100}%`,
          });
        }

        if (!this.state.seek) {
          this.playHead.style.left = `${percent}%`;
        }
      }, 1000);
    }

    if (event.target.getPlayerState() === 5) {
      event.target.playVideo();
    }

    this.handleReadyState(event);
  }

  // drag playhead left and right
  handleMouseMove(e) {
    const userOffset = (e.clientX - (this.timeline.offsetLeft + this.controls.offsetLeft));
    this.state.offset = (userOffset) / this.timeline.offsetWidth;
    if (this.state.offset > 1) {
      this.setState({
        offset: 1,
      });
    }

    if (this.state.offset < 0) {
      this.setState({
        offset: 0,
      });
    }

    if (this.state.seek) {
      const offsetString = `${(this.state.offset * 100)}%`;
      this.playHead.style.left = offsetString;
    }
  }

  // enable playhead drag
  handleMouseDown() {
    this.setState({
      seek: true,
    });
  }

  // disable playhead drag
  handleMouseUp() {
    this.setState({
      seek: false,
    });

    const seekTime = this.state.totalTime * this.state.offset;
    this.player.seekTo(seekTime, true);
  }

  // render either a spinner or youtube component
  renderVideo() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        controls: 0, // hide player controls
        // start: 10, // set player start time
        // end: 20, // set player end time
        iv_load_policy: 3, // hide annotations
        rel: 0, // hide related videos
        showinfo: 0, // hide video title
      },
    };

    if (!this.state.currentVideo.url) {
      return <i className="fa fa-spinner fa-pulse fa-3x fa-fw" />;
    }

    return (
      <YouTube
        videoId={this.state.currentVideo.url}
        opts={opts}
        onReady={this.handleReadyState}
        onStateChange={this.handleStateChange}
        onEnd={this.handleEnd}
        onPlay={this.handlePlay}
        className="player"
      />
    );
  }

  // chooses whether to render the "Extreme" button or not
  renderButtons() {
    return (this.state.channel_id === 0 || this.state.channel_id === 'default')
      ? <div className="player-buttons small-6 columns">
        <button className="button alert" onClick={this.handleLame}>
          <i className="fa fa-thumbs-down" />
          Lame
        </button>
      </div>
      : <div className="player-buttons small-6 columns">
        <button
          className="button"
          onClick={this.handleExtreme}
        >
          <i className="fa fa-thumbs-up" />
          {this.state.extreme ? 'Extreme Stop' : 'Extreme Start'}
        </button>
        <button className="button alert" onClick={this.handleLame}>
          <i className="fa fa-thumbs-down" />
          Lame
        </button>
      </div>;
  }

  render() {
    return (
      <div>
        <div className="flex-video widescreen">
          {this.renderVideo()}
        </div>
        <section className="player-controls" id="playerControls" onMouseMove={this.handleMouseMove}>
          <div className="timeline" id="timeline">
            <div id="moments" />
            <div
              className="playHead"
              id="playHead"
              onMouseDown={this.handleMouseDown}
              onMouseUp={this.handleMouseUp}
            />

          </div>
        </section>

        <section className="player-info row">
          <div id="stats" className="small-6 columns">
            <div>
              <span id="timeElapsed" /> / <span id="totalTime" />
            </div>
            <div id="percentageComplete" />
          </div>
          { this.renderButtons() }
        </section>
        <div>
         <VideoDescription/>
         </div>
      </div>

    );
  }
}

PlayerWindow.propTypes = {
  videos: React.PropTypes.array,
  channel_id: React.PropTypes.any,
  user_id: React.PropTypes.any,
  onVideoChange: React.PropTypes.func
};
