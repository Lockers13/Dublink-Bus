var current_user = context.current_user
//FavouiteStops used for marker icon if statement
const favouriteStops = []
//Used for unfavourite functionality
const favouriteStopsPKs = []

var markerList = []
var polyline = []


//Called from infowindow button
function addFavStop(stopid) {
	user = current_user
	axios.post('http://127.0.0.1:8000/api/favstop/create/', {
		name: "test",
		stopid: stopid,
		user: user,
		current_user: user
	})
		.then(res => console.log(res))
		.catch(err => console.log(err));
}

//Called from info window button
function removeFavStop(stopid) {
	var index = favouriteStops.indexOf(stopid);
	var primarykey = (favouriteStopsPKs[index]);
	axios.delete(`http://127.0.0.1:8000/api/favstop/destroy/${primarykey}`)
		.then(res => console.log(res))
		.catch(err => console.log(err));
}

//Function is automatically as callback in index.html script tag for map
function initMap() {
	//Map options
	var options = {
		zoom: 13,
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
	var markerCluster = new MarkerClusterer(map, [], clusterOptions);
	//Contains all the marker objects
	var markerList = []
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
	function addMarker(stop, prev_stop, line_color, route=false) {

		if (!(prev_stop === null))
			var prev_coords = { lat: prev_stop.lat, lng: prev_stop.long }

		var coords = { lat: stop.lat, lng: stop.long }

		//Style for the icon
		if (favouriteStops.includes(stop.id)) {
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
			map: map,
			icon: icon,
			scaledSize: new google.maps.Size(1, 1),
			name: stop.name,
			id: stop.id
		})
		markerList.push(marker)

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
		if (route === false){
			if (favouriteStops.includes(stop.id)){
				//pass
			}else {
				markerCluster.addMarker(marker)	
			}
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
				infoWindow.setContent('<p>' + marker.name + '</p> <div class="spinner"> <div class="double-bounce1"></div> <div class="double-bounce2"></div> </div>');
				infoWindow.open(map, marker);
				//Using proxyURL here as target blocks by CORS policy
				var proxyURL = "https://thingproxy.freeboard.io/fetch/"
				var targetURL = "https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + marker.id + "&format=json"
				fetch(proxyURL + targetURL)
					.then(response => {
						return response.json();
					})
					.then(data => {
						if (data.results.length === 0) {
							var rtResults = '<p class="pink"> Sorry, no real time information is available </p>'
						}
						else if (data.results.length === 1) {
							var rtResults = '<br> <pclass="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>'
						}
						else if (data.results.length === 2) {
							var rtResults = '<br> <pclass="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<pclass="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>'
						}
						else if (data.results.length === 3) {
							var rtResults = '<br> <pclass="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<pclass="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<pclass="pink">' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>'
						}
						else if (data.results.length === 4) {
							var rtResults = '<br> <pclass="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<pclass="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<pclass="pink">' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>' +
								'<pclass="pink">' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>'
						}
						else if (data.results.length === 5) {
							var rtResults = '<br> <pclass="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<pclass="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<pclass="pink">' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>' +
								'<pclass="pink">' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>' +
								'<pclass="pink">' + data.results[4].route + ' : ' + data.results[4].duetime + '</p>'
						}
						//Max amount of results, may add button to show more / all later
						else {
							var rtResults = '<br> <pclass="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<pclass="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<pclass="pink">' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>' +
								'<pclass="pink">' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>' +
								'<pclass="pink">' + data.results[4].route + ' : ' + data.results[4].duetime + '</p>' +
								'<pclass="pink">' + data.results[5].route + ' : ' + data.results[5].duetime + '</p>'
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
		console.log(route_obj)
		for (let i = 0; i < route_obj.length; i++) {
			fetch("http://localhost:8000/routes/api/predict?lineid=" + route_obj[i]["Line"] +
				"&start_stop=" + route_obj[i]["Departure Stop"].toString() +
				"&end_stop=" + route_obj[i]["Arrival Stop"].toString() +
				"&routeid=" + route_obj[i]["Route ID"])
				.then(response => response.json())
				.then(function (data) {
					console.log(data)
				})
		}
	}

	function getPlotMarkers(route_obj) {
		markerCluster.clearMarkers();
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
					console.log("Test2:", data)
					let line_color;
					line_color = (i % 2 == 0) ? "#1F70E0" : "#FF70E0";
					for (let j = 0; j < data.length; j++) {
						if (j == 0)
							addMarker(data[j], null, line_color, route=true)
						else
							addMarker(data[j], data[j-1], line_color, route=true)
					}
				})
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
				for (let i = 0; i < route_keys.length; i++) {
				
					let route = route_keys[i]
					step_keys = Object.keys(data[route])
					
					if (data[route]["routable"] == "b") {
						route_info[route] = []
						directions.innerHTML += "<h2>Route " + ++count + "</h2><button class='route_plot' id='" + route + "' style='display:inline-block;float:left;'>Plot Route</button>" + 
						"<button class='route_pred' id='" + route + "_pred' style='display:inline-block;float:left;'>Predict Route</button><br><br>"
						for (let j = 0; j < step_keys.length; j++) {
							let step = "Step_" + (j + 1)
							try {
								directions.innerHTML += "-> " + data[route][step]["Instructions"] + "<br>"

								if (Object.keys(data[route][step]).length > 1) {

									route_info[route].push({
										"Line": data[route][step]["Line"],
										"Departure Stop": data[route][step]["Route Validation"]["Start_stop"],
										"Arrival Stop": data[route][step]["Route Validation"]["End stop"],
										"Route ID": data[route][step]["Route Validation"]["Route ID"]
									})
									directions.innerHTML += "<ul style'margin-left:200px;'>"
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

				let plot_btns = document.getElementsByClassName('route_plot')
				let route_info_keys = Object.keys(route_info)
				let pred_btns = document.getElementsByClassName('route_pred')
				
				for (let z = 0; z < plot_btns.length; z++) {
					try {
						if(route_info[route_info_keys[z]].length > 0) {

							keyed_button = document.getElementById(route_info_keys[z])
							keyed_button.addEventListener("click", getPlotMarkers.bind(event, route_info[route_info_keys[z]]))
						}
					}
					catch (e) {
						console.log(e.message)
					}
					}
				for (let index = 0; index < pred_btns.length; index++) {
					try {
						if(route_info[route_info_keys[index]].length > 0) {

							keyed_button_pred = document.getElementById(route_info_keys[index] + "_pred")
							keyed_button_pred.addEventListener("click", predictRoute.bind(event, route_info[route_info_keys[index]]))
						}
					}
					catch (e) {
						console.log(e.message)
					}
					}
				})
	}


	get_button.addEventListener("click", routeViewClick)

	//////////// end of route plotting code


	const getFavIDs = new Promise((resolve, reject) => {
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
	async function getFavIDsAwait() {
		const IDs = await getFavIDs;
		//stops_import from static_stops.js
		stops_import.forEach((stop) => {
		 	addMarker(stop, prev_stop=null, line_color=null, route=false)
		})
	}
	getFavIDsAwait()

	//Functionality for the map search bar
	const inputBox = document.getElementById('stoptextbox');
	function findStop() {
		var station = inputBox.value;
		for (i = 0; i < stops_import.length; i++) {
			if (station === stops_import[i].name) {
				var latLng = new google.maps.LatLng(stops_import[i].lat, stops_import[i].long);
				map.panTo(latLng);
				//Need to add in fetch for real time, loader, buttons etc.
				var loader = '<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
				infoWindow.setContent('<p>' + stops_import[i].name + '</p>' + loader);
				setTimeout(function () {
					//Zoom in
					map.setZoom(16);
				}, 1000)
				infoWindow.open(map, markerList[i]);
				//Will fix the repetition of this code later
				var proxyURL = "https://thingproxy.freeboard.io/fetch/"
				var targetURL = "https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + markerList[i].id + "&format=json"
				fetch(proxyURL + targetURL)
					.then(response => {
						return response.json();
					})
					.then(data => {
						if (data.results.length === 0) {
							var rtResults = '<p class="pink"> Sorry, no real time information is available </p>'
						}
						else if (data.results.length === 1) {
							var rtResults = '<br> <p class="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>'
						}
						else if (data.results.length === 2) {
							var rtResults = '<br> <p class="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<p class="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>'
						}
						else if (data.results.length === 3) {
							var rtResults = '<br> <p class="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<p class="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<p class="pink">' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>'
						}
						else if (data.results.length === 4) {
							var rtResults = '<br> <p class="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<p class="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<p class="pink">' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>' +
								'<p class="pink">' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>'
						}
						else if (data.results.length === 5) {
							var rtResults = '<br> <p class="pink">' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<p class="pink">' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<p class="pink">' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>' +
								'<p class="pink">' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>' +
								'<p class="pink">' + data.results[4].route + ' : ' + data.results[4].duetime + '</p>'
						}
						//Max amount of results, may add button to show more / all later
						else {
							var rtResults = '<br> <p>' + data.results[0].route + ' : ' + data.results[0].duetime + '</p>' +
								'<p>' + data.results[1].route + ' : ' + data.results[1].duetime + '</p>' +
								'<p>' + data.results[2].route + ' : ' + data.results[2].duetime + '</p>' +
								'<p>' + data.results[3].route + ' : ' + data.results[3].duetime + '</p>' +
								'<p>' + data.results[4].route + ' : ' + data.results[4].duetime + '</p>' +
								'<p>' + data.results[5].route + ' : ' + data.results[5].duetime + '</p>'
						}
						infoWindow.setContent(
							stops_import[i].name + rtResults
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

	/*setTimeout(() =>{
		markerCluster.clearMarkers();
	}, 10000)*/

}


