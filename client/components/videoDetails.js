import React from 'react';
import { getDescription } from '../models/videoModel.js';

export default class VideoDescription extends React.Component {
	
	constructor (props) {
		super(props)
		this.state = {
			video_Id : ''
		}

		getDescription( this.props.video_Id )
			.then( title => {
				this.setState = ({
					title: title
				});
			});
	}


	render(){
		return(

			<div>
				
				<div className= "details">
					<div>Title {this.state.title}</div>
					<div>Description</div>
				</div>
			</div>



			);
		}
}


