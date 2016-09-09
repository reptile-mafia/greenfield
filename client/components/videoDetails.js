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
					<h2>{ this.state.title }</h2>
				</div>
			</div>
		);
	}
}
