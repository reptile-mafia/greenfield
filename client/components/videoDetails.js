import React from 'react';
import { getDescription } from '../models/videoModel.js';

export default class VideoDescription extends React.Component {
	
	constructor (props) {
		super(props)
		this.state = {
			url : '',
			title: ''
		}

		getDescription(props.url)
			.then( title => {
				
				this.setState({
					title: title
				});
				
			}).fail(err => console.log(err));
	}


	render(){
		return(
			<div>
				<div className= "details">
					<h2>{ this.state.title }</h2>
					<div>Description</div>
				</div>
			</div>



			);
		}
}


