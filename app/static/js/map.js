const current_user = context.current_user
//FavouiteStops used for marker icon if statement
const favouriteStops = []
//Used for unfavourite functionality
const favouriteStopsPKs = []


//Called from infowindow button
function addFavStop (stopid){
		user = current_user
		axios.post('http://127.0.0.1:8000/api/favstop/create/', {
			name : "test",
			stopid : stopid,
			user : user,
			current_user: user
		})
		.then(res => console.log(res))
		.catch(err => console.log(err));
}

//Called from info window button
function removeFavStop (stopid){
		var index = favouriteStops.indexOf(stopid);
		var primarykey = (favouriteStopsPKs[index]);
		axios.delete(`http://127.0.0.1:8000/api/favstop/destroy/${primarykey}`)
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

		// UNCOMMENT BELOW TO LOAD MARKERS BY FAV LINES!!
		// google.maps.event.addListenerOnce(map, 'idle', map_route)

		// function map_route() {
		// 	fetch("http://127.0.0.1:8000/routes/api/routemaps/46A")
		// 	.then(response => response.json())
		// 	.then(function (data) {
		// 		for(var i = 0; i < Object.keys(data).length; i++) { 
		// 			var key = Object.keys(data)[i];
		// 			for(var j = 0; j < data[key].length; j++) {
		// 				try {
		// 					addMarker(data[key][j]);
		// 				}
		// 				catch {
		// 					;
		// 				}
					
						
		// 			}
	
			
		// 		}
		// 	}
		// 	)}

		var i;
		//Contains all the marker objects
		var markerList = [] 
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
			markerList.push(marker)

			//Content for infowindow
			if(favouriteStops.includes(stop.id)){
	        	var contentString = marker.name + '<br>' + '<button id="removeFavBtn" htmlType="submit" onClick=removeFavStop(' + marker.id + ')> Unfavourite Stop </button>' 
	          	
			} else {
	            var contentString = marker.name + '<br>' + '<button id="favBtn" htmlType="submit" onClick=addFavStop(' + marker.id + ')> Add Stop As Favourite </button>'   	
			}


			var infoWindow = new google.maps.InfoWindow();
			//Marker click event
          	google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                    	//Using proxyURL here as target blocks by CORS policy
                    	var proxyURL = "https://cors-anywhere.herokuapp.com/"
                    	var targetURL = "https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + marker.id + "&format=json"
                    	fetch(proxyURL + targetURL)
                    	.then(response => {
                    		return response.json();
                    	})
                    	.then(data => {
                    		console.log(data)
                    		infoWindow.setContent(
                    			contentString + 
                    			//Need to implement a loop to dispaly between 1 and 5
                    			//Set to 3 as some stops only have 3 pieces of information
                    			//If no information display: "Sorry, no real time data is available"
                    			'<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
                    			'<p>' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
                    			'<p>' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>'
                    		)
                    	})
                        //infoWindow.setContent(contentString);
                        infoWindow.open(map, marker);
                	}
            })(marker, i));
		}

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
  						favouriteStopsPKs.push(stop.id)
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
			// COMMENT BELOW TO ONLY SHOW MARKERS FOR FAV LINES
			stops_import.forEach((stop) => {
				addMarker(stop)
			})
			/*for(var i = 0;i < stops_import.length;i++){
        	addMarker(stops_import[i]);
        	}*/
		}
		getFavIDsAwait()	
}

