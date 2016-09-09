import React from 'react';
import { getDescription } from '../models/videoModel.js';

export default class VideoDescription extends React.Component {

	constructor (props) {
		super(props)
		this.state = {
			url : '',
			title: ''
		}
	}

	componentWillReceiveProps (nextProps) {
		getDescription(nextProps.url)
			.then( title => {
				this.setState({
					title: title
				});
				console.log('Title: ', title);
			}).fail(err => console.log(err));
	}

	render(){
		return(
			<div>
				<div className= "details">
					<h3>{ this.state.title.title }</h3>
					<h5>{this.state.title.description}</h5>
				</div>
			</div>
		);
	}
}
