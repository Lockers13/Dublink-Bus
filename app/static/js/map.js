var current_user = context.current_user
//FavouiteStops used for marker icon if statement
const favouriteStops = []
//Used for unfavourite functionality
var favouriteStopsPKs = []

var favMarkers = []
var markerList = []
var polyline = []
let markerClusterList = []


//Called from infowindow button
function addFavStop(stopid) {

	const addNewFav = new Promise((resolve, reject) => {
		user = current_user
		axios.post('http://127.0.0.1:8000/api/favstop/create/', {
			name: stopid,
			stopid: stopid,
			user: user,
			current_user: user
		})
		.then(res => resolve(res))
		.catch(err => reject(err))
	});

	async function getFavStops() {
		favouriteStopsPKs = []
		setTimeout(()=>{
			fetch("api/favstop/")
			.then(response => {
				return response.json();
			})
			.then(data => {
				data.forEach((stop) => {
					favouriteStopsPKs.push(stop.id)
				});
			})
			.catch(error => {
				console.log(error)
			})
		},3000)
		//Increase this number if want to be a delay effect between map load and stops load 	
	}
	getFavStops()

	//Adjust front end
	var icon = {
				url: '../static/images/favourite.png',
				scaledSize: new google.maps.Size(12, 12)
			};

	for (var i=0; i<markerList.length; i++){
		if(stopid === markerList[i].id){
			markerList[i].setIcon(icon)
			favMarkers.push(markerList[i])
			favouriteStops.push(markerList[i].id)
		}
	}

}

//Called from info window button
function removeFavStop(stopid) {
	//Communicate with backend
	var index = favouriteStops.indexOf(stopid);
	var primarykey = (favouriteStopsPKs[index]);
	console.log("Primary key is: ", primarykey);
	axios.delete(`http://127.0.0.1:8000/api/favstop/destroy/${primarykey}`)
		.then(res => console.log("Success", res))
		.catch(err => console.log("Error", err))
	//Adjust front end
	var icon = {
				url: '../static/images/bus-stop.png',
				scaledSize: new google.maps.Size(12, 12)
			};
			
	for (var i=0; i<favMarkers.length; i++){
		if(stopid === favMarkers[i].id){
			favMarkers[i].setIcon(icon)
			markerList.push(favMarkers[i])
		}
		else{
			console.log("No match")
		}
	}
}

function favStopButton(stopid){
	console.log("Favourite button has been clicked")
	
	var button = document.getElementById('favBtn')
	if (button.innerHTML===" Add Stop As Favourite "){
		addFavStop(stopid)
		button.innerHTML = " Unfavourite Stop ";
	}
	else if (button.innerHTML===" Unfavourite Stop "){
		console.log("Unfavourite button of fav has been clicked")
		removeFavStop(stopid)
		button.innerHTML = " Add Stop As Favourite ";
	}
}

//Function is automatically as callback in index.html script tag for map
function initMap() {
	//Map options
	var options = {
		zoom: 16,
		center: { lat: 53.3477, lng: -6.2800 },
		styles: mapStyle,
		disableDefaultUI: true
	}

	//Creating the map 
	var map = new google.maps.Map(document.getElementById('map'), options);
	//Decrease number to view individual stops from greater height
	var clusterOptions = {
		maxZoom: 15
	};
	/*var markerCluster = new MarkerClusterer(map, [], clusterOptions);*/
	//Contains all the marker objects
	//var markerList = []
	var i;
	//Infowindow must be created outside of the addMarker loop
	var infoWindow = new google.maps.InfoWindow({
		content: '' //Put loader as the content here
	});

	//ClearOverlay clears the map for route drawing 
	function clearOverlays() {

		for (var i = 0; i < markerList.length; i++) {
			markerList[i].setMap(null);
		}
		markerList.length = 0;
	}
	function removeLine() {
		for (var i = 0; i < polyline.length; i++) {
			polyline[i].setMap(null);
		}
		polyline.length = 0;
	  }

	//Add marker function
	function addMarker(stop, prev_stop, line_color, route=false, favourite=false) {

		if (!(prev_stop === null))
			var prev_coords = { lat: prev_stop.lat, lng: prev_stop.long }

		var coords = { lat: stop.lat, lng: stop.long }

		//Style for the icon
		if (favourite === false){
			var icon = {
				url: '../static/images/bus-stop.png',
				scaledSize: new google.maps.Size(12, 12)
			};
		} else {
			var icon = {
				url: '../static/images/favourite.png',
				scaledSize: new google.maps.Size(12, 12)
			};
		}
		//Style for marker
		var marker = new google.maps.Marker({
			position: coords,
			map: map,
			icon: icon,
			scaledSize: new google.maps.Size(1, 1),
			name: stop.name,
			id: stop.id, 
			latlng: coords
		})

		if (favourite === false){
			markerList.push(marker)
		} else {
			favMarkers.push(marker)
		}

		if (!(prev_stop === null)) {
			var line = new google.maps.Polyline({
				path: [prev_coords, coords],
				geodesic: true,
				strokeColor: line_color,
				strokeOpacity: 1.0,
				strokeWeight: 2
			});

			polyline.push(line)
			line.setMap(map);
		}


		//Used for clustering, will exclude favourites so are visible outside clusters
		/*if (route === false){
			if (favouriteStops.includes(stop.id)){
				//pass
			}else {
				markerCluster.addMarker(marker)	
			}
		}*/

		//Content for infowindow
		if(favourite === true){
			var contentString = '<h6 class="windowtitle">' + marker.name + '</h6>' + '<br>' + '<button class="windowbtn" id="favBtn" htmlType="submit" onClick=favStopButton(' + marker.id + ')> Unfavourite Stop </button>' 
		} else {
	    	var contentString = '<h6 class="windowtitle">' + marker.name + '</h6>' + '<br>' + '<button class="windowbtn" id="favBtn" htmlType="submit" onClick=favStopButton(' + marker.id + ')> Add Stop As Favourite </button>' 
	    }	
		

		//Marker click event
		google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				//Initially set to loader
				infoWindow.setContent(contentString);
				infoWindow.open(map, marker);
				map.setCenter(this.getPosition());
				fetch("http://localhost:8000/routes/api/realtime/?stopid="+marker.id)
					.then(response => {
						return response.json();
					})
					.then(data => {
						if (data.results.length === 0) {
							var rtResults = '<p class="realtimeerror"> Sorry, no real time information is available </p>'
						}
						else if (data.results.length === 1) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 2) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 3) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 4) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[3].route + '</td> <td>' + data.results[3].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 5) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[3].route + '</td> <td>' + data.results[3].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[4].route + '</td> <td>' + data.results[4].duetime + '</td> </tr>' +
							'</table>'
						}
						//Max amount of results, may add button to show more / all later
						else {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[3].route + '</td> <td>' + data.results[3].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[4].route + '</td> <td>' + data.results[4].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[5].route + '</td> <td>' + data.results[5].duetime + '</td> </tr>' +
							'</table>'
						}
						infoWindow.setContent(
							contentString + rtResults
						)

					})
			}
		})(marker, i));
	}


	//////// start of route plotting code

	const get_button = document.getElementById('planRouteSubmit')
	const directions = document.getElementById('results2')

	function predictRoute(route_obj) {
		//Dates and dates index coming from route_predict.js

		let chosenDate = dates[datesIndex];
		let weather_data = {"spec": ""}

		let hours = parseInt(document.getElementById('time').value.substring(0,2), 10);
		let minutes = parseInt(document.getElementById('time').value.substring(3,5), 10);
		// get seconds since midnight for model
		let seconds = ((hours * 3600) + (minutes * 60))

		let datetimestr = chosenDate + " " + hours + ":00:00"

		fetch('http://localhost:8000/routes/api/get_weather?datetime=' + datetimestr)
		.then(response => response.json())
		.then(function (data) {
			if(data["hourly_weather"].length != 0) {
				weather_data["weather"] = data["hourly_weather"][0]
				weather_data["spec"] = "hourly"
			}
			else {
				weather_data["weather"] = data["daily_weather"][0]
			}

			})
		.then(function () {
			let temp = (weather_data["spec"] == "hourly")? weather_data["weather"]['temp']: weather_data["weather"]['day_temp'];
			let rain = weather_data["weather"]['rainfall']
			for (let i = 0; i < route_obj.length; i++) {
				fetch("http://localhost:8000/routes/api/predict?lineid=" + route_obj[i]["Line"] +
					"&start_stop=" + route_obj[i]["Departure Stop"].toString() +
					"&end_stop=" + route_obj[i]["Arrival Stop"].toString() +
					"&routeid=" + route_obj[i]["Route ID"] +
					"&time_secs=" + seconds +
					"&temp=" + temp + 
					"&rain=" + rain +
					"&dow=" + chosenDay)
					.then(response => response.json())
					.then(function (data) {
						console.log(data)
						alert("Your planned route will take approx: " + 
						data["journey_info"]["journey_time"]["hours"] + " hours and " + 
						data["journey_info"]["journey_time"]["minutes"] + " minutes")
					})
			}
			
		})
		
	}

	function getPlotMarkers(route_obj) {
		markerClusterList[0].clearMarkers();
		clearOverlays()
		//var markerCluster = new MarkerClusterer(map, [], clusterOptions);
		removeLine()
		for (let i = 0; i < route_obj.length; i++) {
			fetch("http://localhost:8000/routes/api/routemaps?lineid=" + route_obj[i]["Line"] +
				"&start=" + route_obj[i]["Departure Stop"] +
				"&end=" + route_obj[i]["Arrival Stop"] +
				"&routeid=" + route_obj[i]["Route ID"])
				.then(response => response.json())
				.then(function (data) {
					console.log(data);
					let line_color;
					line_color = (i % 2 == 0) ? "#1F70E0" : "#FF70E0";
					for (let j = 0; j < data.length; j++) {
						if (j == 0)
							addMarker(data[j], null, line_color, route=true)
						else
							addMarker(data[j], data[j-1], line_color, route=true)
					}
					var latLng = new google.maps.LatLng(data[0].lat, data[0].long);
					map.panTo(latLng);
					map.setZoom(13);
				})
		}

	}

	function takeTrip(route_obj) {
		console.log(JSON.stringify(route_obj))

	}

	function bind_buttons(btn_array, id_suffix, route_info, route_info_keys, func) {
		for (let index = 0; index < btn_array.length; index++) {
			try {
				if(route_info[route_info_keys[index]].length > 0) {
					keyed_button = document.getElementById(route_info_keys[index] + id_suffix)
					keyed_button.addEventListener("click", func.bind(event, route_info[route_info_keys[index]]))
				}
			}
			catch (e) {
				console.log(e.message)
			}
			}
	}

	function routeViewClick(event) {
		let addr1 = document.getElementById('startLocation').value
		let addr2 = document.getElementById('endLocation').value
		addr1 = addr1.replace(" ", "%20").replace("'", "%27")
		addr2 = addr2.replace(" ", "%20").replace("'", "%27")

		fetch("http://localhost:8000/routes/api/find_route?start_addr=" + addr1 +
			"&end_addr=" + addr2)
			.then(response => response.json())
			.then(function (data) {
				console.log(data)
				directions.innerHTML = ""
				let route_keys = Object.keys(data)
				let count = 0
				let route_info = {}
				let route_flag = false
				for (let i = 0; i < route_keys.length; i++) {
				
					let route = route_keys[i]
					step_keys = Object.keys(data[route])
					
					if (data[route]["routable"] == "b") {
						route_info[route] = []
						directions.innerHTML += "<h2>Route " + ++count + "</h2><button class='route_plot' id='" + route + "' style='display:inline-block;float:left;'>Plot Route</button>" + 
						"<button class='route_pred' id='" + route + "_pred' style='display:inline-block;float:left;'>Predict Route</button>" +
						"<button class='trip_take' id='" + route + "_trip' style='display:inline-block;float:left;'>Take A Trip</button><br><br>"
						for (let j = 0; j < step_keys.length; j++) {
							let step = "Step_" + (j + 1)
							try {
								directions.innerHTML += "-> " + data[route][step]["Instructions"] + "<br>"

								if (Object.keys(data[route][step]).length > 1) {
									route_flag = true

									route_info[route].push({
										"Line": data[route][step]["Line"],
										"Departure Stop": data[route][step]["Route Validation"]["Start_stop"],
										"Arrival Stop": data[route][step]["Route Validation"]["End stop"],
										"Route ID": data[route][step]["Route Validation"]["Route ID"]
									})
									directions.innerHTML += "<br><ul style'margin-left:200px;'>"
									directions.innerHTML += "<li>Line: " + data[route][step]["Line"] + "</li>"
									directions.innerHTML += "<li>Departure Stop: " + data[route][step]["Departure Stop Name"] + "</li>"
									directions.innerHTML += "<li>Arrival Stop: " + data[route][step]["Arrival Stop Name"] + "</li>"
									directions.innerHTML += "</ul><br>"
								}
							}
							catch {
								;
							}
						}
						directions.innerHTML += "<br>"
					}
				}
				if(!route_flag)
					directions.innerHTML += "<br>Sorry, we could not find any data for the specified route.<br>Please try again...!"

				
				let route_info_keys = Object.keys(route_info)

				let plot_btns = document.getElementsByClassName('route_plot')
				let pred_btns = document.getElementsByClassName('route_pred')
				let trip_btns = document.getElementsByClassName('trip_take')
				
				bind_buttons(plot_btns, "", route_info, route_info_keys, getPlotMarkers)
				bind_buttons(pred_btns, "_pred", route_info, route_info_keys, predictRoute)
				bind_buttons(trip_btns, "_trip", route_info, route_info_keys, takeTrip)
				
				})
	}


	get_button.addEventListener("click", routeViewClick)

	//////////// end of route plotting code


	const getFavIDs = new Promise((resolve, reject) => {
		setTimeout(() => {
			stops_import.forEach((stop) => {
		 		addMarker(stop, prev_stop=null, line_color=null, route=false, favourite=false)
			})
			resolve(null)
			//Increase this number if want to be a delay effect between map load and stops load 	
		}, 1)
	});

	//runs after the map has been populated
	async function getFavIDsAwait() {
		setTimeout(() => {
			if (current_user == 0) {
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
				})
				.catch(error => {
					console.log(error)
				})
			//Increase this number if want to be a delay effect between map load and stops load 	
		}, 1)

		//Runs 2 seconds after to give favStops time to populate
		setTimeout(() =>{
			var icon = {
				url: '../static/images/favourite.png',
				scaledSize: new google.maps.Size(12, 12)
			};
			for(var j =0; j < markerList.length; j++){
				if(favouriteStops.includes(markerList[j].id)){
					markerList[j].setMap(null);
					favouriteStop = {
						id:markerList[j].id, 
						lat:markerList[j].latlng.lat,
						long:markerList[j].latlng.lng,
						name:markerList[j].name
					}
					addMarker(favouriteStop, prev_stop=null, line_color=null, route=false, favourite=true)
					favMarkers.push(markerList[j])
					markerList.splice(j,1)
				}
			}
			//Make clusters here
			var markerCluster = new MarkerClusterer(map, [], clusterOptions);
			markerClusterList.push(markerCluster)
			for(var k=0;k<markerList.length; k++){
				markerCluster.addMarker(markerList[k])
			}
		},2000)
	}
	getFavIDsAwait()

	//Functionality for the map search bar
	const inputBox = document.getElementById('stoptextbox');
	function findStop() {
		var station = inputBox.value;
		var split = station.split(" (")
		var stop = split[0]
		var stopidString = split[1].substring( split[1].lastIndexOf(":") + 1, split[1].lastIndexOf(" "));
		var stopid = parseInt(stopidString, 10);
		console.log(stopid)
		for (i = 0; i < stops_import.length; i++) {
			if (stop === stops_import[i].name && stopid === stops_import[i].id) {

				if(favouriteStops.includes(stops_import[i].id)){
				var contentString = '<h6 class="windowtitle">' + stops_import[i].name + '</h6>' + '<br>' + '<button class="windowbtn" id="removeFavBtn" htmlType="submit" onClick=removeFavStop(' + stops_import[i].id + ')> Unfavourite Stop </button>' 
				} else {
		    	var contentString = '<h6 class="windowtitle">' + stops_import[i].name + '</h6>' + '<br>' + '<button class="windowbtn" id="favBtn" htmlType="submit" onClick=addFavStop(' + stops_import[i].id + ')> Add Stop As Favourite </button>'   	
				}


				var latLng = new google.maps.LatLng(stops_import[i].lat, stops_import[i].long);
				map.panTo(latLng);
				//Need to add in fetch for real time, loader, buttons etc.
				infoWindow.setContent(contentString);
				setTimeout(function () {
					//Zoom in
					map.setZoom(16);
				}, 1000)
				infoWindow.open(map, markerList[i]);
				//Will fix the repetition of this code later
				//var proxyURL = "https://thingproxy.freeboard.io/fetch/"
				//var targetURL = "https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + markerList[i].id + "&format=json"
				fetch("http://localhost:8000/routes/api/realtime/?stopid="+markerList[i].id)
					.then(response => {
						return response.json();
					})
					.then(data => {
						if (data.results.length === 0) {
							var rtResults = '<p class="realtimeerror"> Sorry, no real time information is available </p>'
						}
						else if (data.results.length === 1) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 2) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 3) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 4) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[3].route + '</td> <td>' + data.results[3].duetime + '</td> </tr>' +
							'</table>'
						}
						else if (data.results.length === 5) {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[3].route + '</td> <td>' + data.results[3].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[4].route + '</td> <td>' + data.results[4].duetime + '</td> </tr>' +
							'</table>'
						}
						//Max amount of results, may add button to show more / all later
						else {
							var rtResults = '<table class="realtime">'+
							'<tr> <th> Route </th> <th> Arrival Time </th> </tr>'+
							'<tr> <td>' + data.results[0].route + '</td> <td>' + data.results[0].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[1].route + '</td> <td>' + data.results[1].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[2].route + '</td> <td>' + data.results[2].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[3].route + '</td> <td>' + data.results[3].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[4].route + '</td> <td>' + data.results[4].duetime + '</td> </tr>' +
							'<tr> <td>' + data.results[5].route + '</td> <td>' + data.results[5].duetime + '</td> </tr>' +
							'</table>'
						}
						infoWindow.setContent(
							contentString + rtResults
						)
					})
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

	/* Below Timeouts are to display and upadate users position on the map */

	var currentPosList = []
	//Timeout as takes a couple of seconds for laptops, works faster using mobile phone GPS
	setTimeout(() => {
		//currentLocation varibale comes from geolocation.js
		var coords = { lat: currentLocation.latitude, lng: currentLocation.longitude }
		var icon = '../static/images/currentLocation.png'
		var marker = new google.maps.Marker({
			position: coords,
			map: map,
			icon: icon,
			scaledSize: new google.maps.Size(1, 1),
			name: "Current Location",
		});
		currentPosList.push(marker)
		var latLng = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
		map.panTo(latLng);
		map.setZoom(16)
	}, 2000);

	//Map will display before this with markers
	//Begin tracking location 2 seconds after have set location on map
	//Jumps may occur, won't occur with mobile use due to GPS
	setTimeout(() => {
		id = navigator.geolocation.watchPosition(
			//First arg is for success
			data => {
				//console.log(currentPosList);
				currentPosList[0].setMap(null);
				currentPosList.shift();
				var lat = data.coords.latitude;
				var lng = data.coords.longitude;
				var coords = { lat: lat, lng: lng }
				var icon = '../static/images/currentLocation.png'
				var marker = new google.maps.Marker({
					position: coords,
					map: map,
					icon: icon,
					scaledSize: new google.maps.Size(1, 1),
					name: "Current Location",
				});
				currentPosList.push(marker);
				var latLng = new google.maps.LatLng(lat, lng);
				map.panTo(latLng);
				//updatedLatLng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
				//console.log(updatedLatLng);
			},
			//Second arg is for errors
			error => console.log(error),
			//Third arg is for options
			{
				enableHighAccuracy: true
			}
		);
	}, 4000);

}


