import React from 'react';
import { getDescription } from '../models/videoModel.js';

export default class VideoDescription extends React.Component {
	
	constructor (props) {
		super(props)
		this.state = {
			url : ''
		}

		

		getDescription(props.url)
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
					
					<Title/>
					<div>Description</div>
				</div>
			</div>



			);
		}
}


