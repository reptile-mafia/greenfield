import React from 'react';
import YouTube from 'react-youtube';
import { sendLike, Moment, getMoreVideos } from '../models/videoModel.js';
// import $ from '../models/lib/jquery';
import MixtapeModel from '../models/mixtapeModel';

// Use like: <MixtapePlayer user_id="1" />

export default class MixtapePlayer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentVideo: {
        url: null,
        moment: null
      }
    };
    this.momentIterator = null;
    this.currentMoment = null;

    MixtapeModel.getMomentIteratorForUser()
      .then((iter) => {
        if (iter !== null) {
          this.momentIterator = iter;
          var url = iter.nextVideo();
          this.setVideoUrlState(url);
          this.currentMoment = iter.nextMoment();
        }
      });

  }

  setVideoUrlState(url) {
    this.props.onVideoChange(url)
    this.setState({
      currentVideo: {
        url: url
      }
    });
  }

  // Sets current video
  updateVideo(momentIterator, player, delay) {
    window.setTimeout(() => {
      // Have we actually passed the end of the current moment? Video could have been delayed.
      if (player.getCurrentTime() >= this.currentMoment.stop_time) {
        // Do we have another moment for this video?
        if (momentIterator.hasNextMoment()) {
          // We do! set the next moment and seek to it's start_time
          let moment = momentIterator.nextMoment();
          this.currentMoment = moment;
          player.seekTo( moment.start_time );
          // Set next updateVideo timeout
          this.updateVideo(momentIterator, player,
            (moment.stop_time - moment.start_time) * 1000);
          // We don't have another moment. Do we have another video?
        } else if (momentIterator.hasNextVideo()) {
          //  We do! set the url for currentVideo so the youtube player can advance
          var url = momentIterator.nextVideo();
          var moment = momentIterator.nextMoment();
          this.setVideoUrlState(url);
          this.currentMoment = moment;
          // Schedule next updateVideo timeout
          this.updateVideo(momentIterator, player,
            (moment.stop_time - moment.start_time) * 1000);
          // We don't have any more moments or videos -- reset and loop again!
        } else {
          this.momentIterator.reset();
          var url = iter.nextVideo();
          this.setVideoUrlState(url);
          this.currentMoment = this.momentIterator.nextMoment();
        }
      } else {
        // We have not yet truly reached end of the current moment
        // Schedule next updateVideo timeout
        this.updateVideo(momentIterator, player,
          (this.currentMoment.stop_time - player.getCurrentTime()) * 1000);
      }
    }, delay);
  }
  //(end_time - start_time) * 1000

  // ready state from player API
  handleReadyState(event) {
    var player = event.target;
    player.mute();
    var moment = this.currentMoment;
    player.seekTo(moment.start_time);
    var delay = (moment.stop_time - moment.start_time) * 1000;
    if (this.momentIterator !== null) {
      this.updateVideo(this.momentIterator, player, delay);
    }
  }

  handleStateChange(event) {

    var player = event.target;
    // When a new video is cued advance to the start_time of the currentMoment
    if (player.getPlayerState() === -1) {
      player.seekTo(this.currentMoment.start_time);
    }
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
        autoplay: 1
      },
    };

    if (!this.state.currentVideo.url) {
      return <i className="fa fa-spinner fa-pulse fa-3x fa-fw" />;
    }

    return (
      <YouTube
        videoId={this.state.currentVideo.url}
        opts={opts}
        onReady={ this.handleReadyState.bind(this) }
        onStateChange={ this.handleStateChange.bind(this) }
        onEnd={this.handleEnd}
        onPlay={this.handlePlay}
        className="player"
      />
    );
  }

    render() {
      return (
        <div>
          <div className="flex-video widescreen">
            { this.renderVideo() }
          </div>
        </div>
      );
    }

}

MixtapePlayer.propTypes = {
  //user_id: React.PropTypes.any,
  onVideoChange: React.PropTypes.func,
};
