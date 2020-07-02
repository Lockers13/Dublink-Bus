function addFavStop (){
			console.log(favouriteStops)
		}

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
				console.log(favouriteStops)
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
			var infoWindow = new google.maps.InfoWindow({
            	content: marker.name + '<br>' + '<button htmlType="submit" onClick=addFavStop()> Add Stop As Favourite </button>'
          	});
			//Marker click event
          	marker.addListener('click', function(){
	        	infoWindow.open(map, marker);
	        });
		}

		//Favouite stops will be pushed in here
		const favouriteStops = []

      	const getFavIDs = new Promise((resolve, reject) => {
			setTimeout(() =>{
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
			}, 1)
		});

      	//This function must wait until the for each loop above has resolved to run.
      	//This function actually populates the map with the markers in the foreach loop
		async function getFavIDsAwait(){
			const IDs = await getFavIDs;
			console.log("From await: ", IDs)
			stops_import.forEach((stop) => {
				addMarker(stop)
			})
			/*for(var i = 0;i < stops_import.length;i++){
        	addMarker(stops_import[i]);
        	}*/
		}
		getFavIDsAwait()	
}

