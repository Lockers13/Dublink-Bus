import React from 'react';
import axios from 'axios';

const FavouritBtn = ({data}) => {
	
	function addFavStop () {
		const id = data.id
		const name = data.name
		const user = context.current_user

		axios.post('http://127.0.0.1:8000/api/favstop/create/', {
			name : name,
			stopid : id,
			user : user,
			current_user: user
		})
		.then(res => console.log(res))
		.catch(err => console.log(err));
	}

	return(
			<button htmlType="submit" onClick={addFavStop}>
  				Add Stop As Favourite
			</button>
		);
}

export default FavouritBtn;