const current_user = context.current_user

console.log(current_user)

function removeFavStop (id){
		user = current_user
		console.log(id)
		console.log(user)
}

function addFavStop (id){
		user = current_user
		axios.post('http://127.0.0.1:8000/api/favstop/create/', {
			name : "test",
			stopid : id,
			user : user,
			current_user: user
		})
		.then(res => console.log(res))
		.catch(err => console.log(err));
}

//Function is automatically as callback in index.html script tag for map
function initMap(){
		//Map options
		var options = {
			zoom: 15,
			center: {lat:53.3477, lng:-6.2800},
			styles: mapStyle,
			disableDefaultUI: true
		}

		//Creating the map 
		var map = new google.maps.Map(document.getElementById('map'), options);


		//Add marker function
		function addMarker(stop){

			var coords = {lat: stop.lat, lng: stop.long}
			//Style for the icon
			if (favouriteStops.includes(stop.id)){
				var icon = {
	    			url: '../static/images/favourite.png',
	    			scaledSize: new google.maps.Size(12, 12)
				};
			} else {
				var icon = {
	    			url: '../static/images/bus-stop.png',
	    			scaledSize: new google.maps.Size(12, 12)
				};
			}
			//Style for marker
			var marker = new google.maps.Marker({
				position: coords,
				map:map,
				icon: icon,
				scaledSize: new google.maps.Size(1, 1),
				name:stop.name,
				id:stop.id
			})
			//Style for window
			if(favouriteStops.includes(stop.id)){
				var infoWindow = new google.maps.InfoWindow({
	            	content: marker.name + '<br>' + '<button htmlType="submit" onClick=removeFavStop(' + marker.id + ')> Unfavourite Stop </button>' 
	          	});
			} else {
				var infoWindow = new google.maps.InfoWindow({
	            	content: marker.name + '<br>' + '<button htmlType="submit" onClick=addFavStop(' + marker.id + ')> Add Stop As Favourite </button>' 
	          	});
			}
			//Marker click event
          	marker.addListener('click', function(){
          		if (infoWindow) {
        			infoWindow.close();
    			}
	        	infoWindow.open(map, marker);
	        });
		}

		//Favouite stops will be pushed in here
		const favouriteStops = []

      	const getFavIDs = new Promise((resolve, reject) => {
			setTimeout(() =>{
				if (current_user == 0){
					resolve(favouriteStops)
				}
				fetch("api/favstop/")
    			.then(response => {
        			return response.json();
    			})
    			.then(data => {
        			data.forEach((stop) => {
  						favouriteStops.push(stop.stopid)
					});
					resolve(favouriteStops)
   				})
   				.catch(error => {
   					reject(console.log(error))
   				})
   			//Increase this number if want to be a delay effect between map load and stops load 	
			}, 1)
		});

      	//This function must wait until the for each loop above has resolved to run.
      	//This function actually populates the map with the markers in the foreach loop
		async function getFavIDsAwait(){
			const IDs = await getFavIDs;
			//stops_import from static_stops.js
			stops_import.forEach((stop) => {
				addMarker(stop)
			})
			/*for(var i = 0;i < stops_import.length;i++){
        	addMarker(stops_import[i]);
        	}*/
		}
		getFavIDsAwait()	
}

