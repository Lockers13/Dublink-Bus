const current_user = context.current_user
//FavouiteStops used for marker icon if statement
const favouriteStops = []
//Used for unfavourite functionality
const favouriteStopsPKs = []

var markerList = [] 

//ClearOverlay clears the map for route drawing 
function clearOverlays() {
	for (var i = 0; i < markerList.length; i++ ) {
	  markerList[i].setMap(null);
	}
	markerList.length = 0;
}


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
			zoom: 13,
			center: {lat:53.3477, lng:-6.2800},
			styles: mapStyle,
			disableDefaultUI: true
		}

		//Creating the map 
		var map = new google.maps.Map(document.getElementById('map'), options);
		//Decrease number to view individual stops from greater height
		var clusterOptions = {
            maxZoom: 15
        };
		var markerCluster = new MarkerClusterer(map, [], clusterOptions);
		//Contains all the marker objects
		var markerList = [] 
		var i;
		//Infowindow must be created outside of the addMarker loop
		var infoWindow = new google.maps.InfoWindow({
            content: '' //Put loader as the content here
        });

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

			//Used for clustering, will exclude favourites so are visible outside clusters
			if (favouriteStops.includes(stop.id)){
				//pass
			}else {
				markerCluster.addMarker(marker)	
			}

			//Content for infowindow
			if(favouriteStops.includes(stop.id)){
	        	var contentString = marker.name + '<br>' + '<button id="removeFavBtn" htmlType="submit" onClick=removeFavStop(' + marker.id + ')> Unfavourite Stop </button>' 
	          	
			} else {
	            var contentString = marker.name + '<br>' + '<button id="favBtn" htmlType="submit" onClick=addFavStop(' + marker.id + ')> Add Stop As Favourite </button>'   	
			}

			//Marker click event
          	google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                    	//Initially set to loader
                    	infoWindow.setContent( '<p>' + marker.name + '</p> <div class="spinner"> <div class="double-bounce1"></div> <div class="double-bounce2"></div> </div>');
                    	infoWindow.open(map, marker);
                    	//Using proxyURL here as target blocks by CORS policy
                    	var proxyURL = "https://thingproxy.freeboard.io/fetch/"
                    	var targetURL = "https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + marker.id + "&format=json"
                    	fetch(proxyURL + targetURL)
                    	.then(response => {
                    		return response.json();
                    	})
                    	.then(data => {
                    		if (data.results.length === 0){
                    			var rtResults = 	"<p> Sorry, no real time information is available </p>"
                    		}
                    		else if (data.results.length === 1){
                    			var rtResults = 	'<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>'
                    		}
                    		else if (data.results.length === 2){
                    			var rtResults = 	'<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' 
                    								+ '<p>' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>'
                    		}
                    		else if (data.results.length === 3){
                    			var rtResults = 	'<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' 
                    								+ '<p>' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>'
                    								+ '<p>' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>'
                    		}
                    		else if (data.results.length === 4){
                    			var rtResults = 	'<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' 
                    								+ '<p>' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>'
                    								+ '<p>' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>'
                    								+ '<p>' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>'
                    		}
                    		else if (data.results.length === 5){
                    			var rtResults = '<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' 
                    								+ '<p>' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>'
                    								+ '<p>' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>'
                    								+ '<p>' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>'
                    								+ '<p>' + data.results[4].route + ' : ' + data.results[4].duetime + '</p>'
                    		}
                    		//Max amount of results, may add button to show more / all later
                    		else {
                    			var rtResults = '<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' 
                    								+ '<p>' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>'
                    								+ '<p>' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>'
                    								+ '<p>' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>'
                    								+ '<p>' + data.results[4].route + ' : ' + data.results[4].duetime + '</p>'
                    								+ '<p>' + data.results[5].route + ' : ' + data.results[5].duetime + '</p>'
                    		}
                    		infoWindow.setContent(
                    			contentString + rtResults
                    		)
               
                    	})   
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
			stops_import.forEach((stop) => {
				addMarker(stop)
			})
		}
		getFavIDsAwait()

		//Functionality for the map search bar
		const inputBox = document.getElementById('stoptextbox'); 
		function findStop(){
			var station = inputBox.value;
			for (i = 0; i < stops_import.length; i++) {
				if (station === stops_import[i].name){
					var latLng = new google.maps.LatLng(stops_import[i].lat, stops_import[i].long);
					map.panTo(latLng);
					//Need to add in fetch for real time, loader, buttons etc.
					infoWindow.setContent('<p>' + stops_import[i].name + '</p><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>');
					setTimeout(function () { 
                            //Zoom in
                            map.setZoom(16);
                        }, 1000)
					infoWindow.open(map, markerList[i]);
					break;
				}
			}
		}

		inputBox.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                findStop();
            }
        });	
}

