import React from 'react';
import { addVideoToChannel } from '../models/videoModel.js';

export default class AddVideo extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      url: '',
      added: false,
      failed: false,
    };
  }

  // handleChange (e) {
  //
  // }

  handleSubmit (e) {
    e.preventDefault(); // Suppress POST

    // Parse url and retrieve youtube video id
    let q = this.state.url.match(/\?v=([^=]+)/);
    if (q !== null) {
      console.log('Adding the following url: ', this.state.url);
      let videoId = q[1];
      console.log('videoId: ', videoId);
      addVideoToChannel(videoId, 1)
        .then(() => {
          this.setState({
            added: true,
            failed: false,
            url: '',
          });
        })
        .fail(() => {
          console.log('Failed.');
          this.setState({
            added: false,
            failed: true,
          })
        });
    } else {
      console.log('Failed. No ID in URL');
      this.setState({
        added: false,
        failed: true,
      });
    }
  }

  render () {
    return (
      <div>
        <form className="addVideoForm" onSubmit={ this.handleSubmit.bind(this) }>
          <input
            type="url"
            value={ this.state.url }
            onChange={ (e) => this.setState({ url: e.target.value }) }
          />
          <input type="submit" value="Add Youtube Video"/>
        </form>
        { this.state.failed ? <span className='errorMessage'>Sorry, unable to add video.</span>   : null }
        { this.state.added  ? <span className='successMessage'>Video Added!</span> : null }
      </div>
    );
  }

}
