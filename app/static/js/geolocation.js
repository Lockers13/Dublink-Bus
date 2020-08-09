var current_user = context.current_user;
let currentLocation;
let locationFound = false;
let permissionDenied = false;

if('geolocation' in navigator) {
 //This simply gets the users location when the pages loads
 //Used for displaying users current location on page load
  navigator.geolocation.getCurrentPosition((position) => {
  		currentLocation = (position.coords);
  		currentLat = currentLocation.latitude;
  		currentLong = currentLocation.longitude;
  		locationFound = true;
	},
	function(error) {
    if (error.code == error.PERMISSION_DENIED)
    	permissionDenied = true;
  	});
}

const getJourney = () => new Promise((resolve, reject) => {
    if (current_user == 0){
        resolve(null);
    }
	fetch("api/plannedjourney/")
	.then(response => {
	    return response.json();
	})
	.then(data => {
		if(data.length === 0){
			resolve(null)
		}
		routes = []
		for (var i =0; i < data.length; i++){
			var id = data[i].id
            var route = JSON.parse(data[i].routeObject)
            route[0]['savedTripID'] = id
            routes.push(route);
        }
       	resolve(routes);
	})
	.catch(error => {
	    reject(error);
	});
}, 1);


async function getJourneyAwait(){
  const routes = await getJourney();
  if(permissionDenied === true){
  	return;
  }
  //Needs to be in this scope
  window.routes = routes
  var innerHTML = " "; 
  if(!(routes === null)) {
    for (var i = 0; i < routes.length; i++){
    	//var line = routes[i].Line
    	var tripID = routes[i][0].savedTripID
    	//var routeNumber = i + 1
    	var indexNum = routes[i].length - 1
    	for(var q = 0; q < stops_import.length; q++){
    		if (routes[i][0]['Departure Stop'] === stops_import[q].id){
    			var startStation = stops_import[q].name
    		}
    		if (routes[i][indexNum]['Arrival Stop'] === stops_import[q].id){
    			var endStation = stops_import[q].name
    		}
    	}
    	innerHTML += '<p class="plannedtripcontainer"><button id="starttripbtn" onClick=startJourney(routes[' + i + '])>'+startStation+' to '+endStation+' </button><button id="removetripbtn" onClick=removeTrip('+tripID+')> X </button></p>'
    }
    document.getElementById('tripmessage').style.display='grid';
    document.getElementById('tripmessage').innerHTML = innerHTML;
  }	else {
  	document.getElementById('tripmessage').innerHTML = '<p class="pleasenote"><span class="pinkspan">PLEASE NOTE:</span> Location tracking must be enabled to use this feature </p><p>Oh No! Looks like you do not have any trips planned. To plan a trip use the route prediction tool above and select "ADD AS SAVED TRIP" to get live updates on your journey times based on our most up to date predictions and see additional journey information. To activate this feature select your desired saved trip when you are within 100 meters of the starting stop.</p>'
  }
}

//Don't want to run if user is not signed in
if(current_user != 0){
	getJourneyAwait()

}

let gotitbuttons = document.getElementsByClassName("gotitbutton")
for (let i =0; i<gotitbuttons.length; i++){
	gotitbuttons[i].addEventListener("click", () =>{
		document.getElementById('cantfindlocation').style.display='none';
		document.getElementById('toofar').style.display = "none";
		getJourneyAwait();
	});
}

function distanceToStop(currentLat, currentLon, destinationLat, destinationLon){
	//Took this formula from "https://www.movable-type.co.uk/scripts/latlong.html"
	const R = 6371e3; // metres
	const φ1 = currentLat * Math.PI/180;
	const φ2 = destinationLat * Math.PI/180;
	const Δφ = (destinationLat-currentLat) * Math.PI/180;
	const Δλ = (destinationLon-currentLon) * Math.PI/180;
	const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	          Math.cos(φ1) * Math.cos(φ2) *
	          Math.sin(Δλ/2) * Math.sin(Δλ/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	const distance = R * c;//This distance is returned in meters
	return distance
}

//Variables for models are dayNum, seconds, currentTemp and currentWeatherDescription
//Information needed for the model predictions
let day = new Date();
//Day should be Mon - Sun ( 0- 6 ) hence the - 1
let dayNum = day.getDay() - 1;
//Change sunday from 0 to 6
if (dayNum === -1){
	dayNum = 6
}
let hours = day.getHours()
let mins = day.getMinutes()
let seconds = ((hours * 3600) + (mins * 60))
let date = moment().format().substring(0,10);
let temp;
let weatherCond;
//Get weather for the models
fetch("http://localhost:8000/routes/api/get_weather/?datetime=" + date + "%20" + hours + ":00:00")
.then(response => {
	return response.json()
})
.then(data => {
	temp = data.hourly_weather[0].temp
	//Not too sure if desc or main will be needed for the final model
	//console.log(data.hourly_weather[0].desc)
	weatherCond = data.hourly_weather[0].main
})


//Route should be the object created from the getRoute function, will be contained in array and can be 1 - 3 objects
function startJourney(route){

	if(locationFound === false){
		document.getElementById('tripmessage').style.display="none";
		document.getElementById('cantfindlocation').style.display='block';
		return;
	}
	let gettingLocationVar = true
	//Switches to true if location is found so timeout error s not shown
	document.getElementById('tripmessage').style.display="none";
	document.getElementById('gettingLocation').style.display="block";


	const getJourneyLegs = () => new Promise((resolve, reject) => {
		let journeyArr= []
		if (route.length === 1){
			let routeid = route[0]['Route ID']
			let lineid = route[0]['Line']
			let startStop = route[0]['Departure Stop']
			let endStop = route[0]['Arrival Stop']
			fetch("http://localhost:8000/routes/api/routemaps/?lineid="+lineid+"&start="+startStop+"&end="+endStop+"&routeid="+routeid)
			.then(response => {
				return response.json()
			})
			.then(data => {
				journeyLegObj = {routeid: routeid, lineid: lineid, stops: data}
				journeyArr.push(journeyLegObj)

				resolve(journeyArr)
			})
		} else if (route.length === 2){
			let routeid = route[0]['Route ID']
			let lineid = route[0]['Line']
			let startStop = route[0]['Departure Stop']
			let endStop = route[0]['Arrival Stop']
			fetch("http://localhost:8000/routes/api/routemaps/?lineid="+lineid+"&start="+startStop+"&end="+endStop+"&routeid="+routeid)
			.then(response => {
				return response.json()
			})
			.then(data => {
				journeyLegObj = {routeid: routeid, lineid: lineid, stops: data}
				journeyArr.push(journeyLegObj)

				//Do second fetch
				routeid = route[1]['Route ID']
				lineid = route[1]['Line']
				startStop = route[1]['Departure Stop']
				endStop = route[1]['Arrival Stop']
				fetch("http://localhost:8000/routes/api/routemaps/?lineid="+lineid+"&start="+startStop+"&end="+endStop+"&routeid="+routeid)
				.then(response => {
					return response.json()
				})
				.then(data => {
					journeyLegObj = {routeid: routeid, lineid: lineid, stops: data}
					journeyArr.push(journeyLegObj)

					resolve(journeyArr)
				})
			})
		} else if (route.length === 3){
			let routeid = route[0]['Route ID']
			let lineid = route[0]['Line']
			let startStop = route[0]['Departure Stop']
			let endStop = route[0]['Arrival Stop']
			fetch("http://localhost:8000/routes/api/routemaps/?lineid="+lineid+"&start="+startStop+"&end="+endStop+"&routeid="+routeid)
			.then(response => {
				return response.json()
			})
			.then(data => {
				journeyLegObj = {routeid: routeid, lineid: lineid, stops: data}
				journeyArr.push(journeyLegObj)
				
				//Do second fetch
				routeid = route[1]['Route ID']
				lineid =route[1]['Line']
				startStop = route[1]['Departure Stop']
				endStop = route[1]['Arrival Stop']
				fetch("http://localhost:8000/routes/api/routemaps/?lineid="+lineid+"&start="+startStop+"&end="+endStop+"&routeid="+routeid)
				.then(response => {
					return response.json()
				})
				.then(data => {
					journeyLegObj = {routeid: routeid, lineid: lineid, stops: data}
					journeyArr.push(journeyLegObj)

					//Do third fetch
					routeid = route[2]['Route ID']
					lineid = route[2]['Line']
					startStop = route[2]['Departure Stop']
					endStop = route[2]['Arrival Stop']
					fetch("http://localhost:8000/routes/api/routemaps/?lineid="+lineid+"&start="+startStop+"&end="+endStop+"&routeid="+routeid)
					.then(response => {
						return response.json()
					})
					.then(data => {
						journeyLegObj = {routeid: routeid, lineid: lineid, stops: data}
						journeyArr.push(journeyLegObj)

						resolve(journeyArr);
					})
				})
			})
		}

		/*setTimeout(()=>{
			resolve(journeyArr)
		},3000)*/
	})

	async function getJourneyLegsAwait(){
  		const journeyArr = await getJourneyLegs();
  		let nextStopList = []
  		for(var i = 0; i < journeyArr.length; i++ ){
  			for( var j = 0; j < journeyArr[i].stops.length; j++){
  				nextStopList.push(journeyArr[i].stops[j])
  			}
  		}
  		setTimeout(() => {

  			console.log("Next stop list: ", nextStopList)
  			let desiredStop = nextStopList[nextStopList.length - 1]
  			let beginningStop = nextStopList[0]

  			if('geolocation' in navigator) {
	   			gettingLocationVar = false;
	   			//This gets the users current locations, once off to ensure they are within the correct distance of start stop
				document.getElementById('gettingLocation').style.display="none";
				document.getElementById('tripmessage').style.display='grid';
				//Plot markers expect route object inside array
				initMap(route)

				if (distanceToStop(currentLat, currentLong, beginningStop.lat, beginningStop.long) > 100000){
					document.getElementById('toofar').style.display = "block";
					document.getElementById('tripmessage').style.display = 'none';
					//Want to end functon in this case
					return;
				}

				else{
					//Display the upcoming stops and information
					document.getElementById('tripmessage').style.display="none";
					document.getElementById('selectedTrip').style.display='block';
					document.getElementById('tripInfo').style.display='block';
					document.getElementById('end').style.display='block';
					let upcomingStops = document.getElementById('upcomingStops');
					stopsLeft.innerHTML = nextStopList.length - 1;
					let index = nextStopList.length - 1;
					let distancetoend = distanceToStop(nextStopList[0].lat, nextStopList[0].long, desiredStop.lat, desiredStop.long)
					let roundedDistance = (distancetoend / 1000).toFixed(2)
					distanceLeft.innerHTML = roundedDistance + " KM"
					//Loop over and display data
					let innerHTML = "";
					for(let j =0; j< nextStopList.length; j++){
						if(j === 0){
							innerHTML += "<p>" + nextStopList[j].name + "<p>"
						}
						else if(j === 1){
							innerHTML += "<p> <span class='nextStop'> Next Stop: </span> " + nextStopList[j].name + "<p>"
							//nextStopList.push(data[j])
						} else {
							innerHTML += "<p>" + nextStopList[j].name + "<p>"
							//nextStopList.push(data[j])
						}
					}
					upcomingStops.innerHTML = innerHTML;
  					timeLeft.innerHTML = "Loading";

  					//Loads of chained fetches, would use async/await if had more time to figure out, just need to get done at this point
					let time = 0
					if (journeyArr.length === 1){
						startStop = journeyArr[0].stops[0].id
						endStop = journeyArr[0].stops[journeyArr[0].stops.length - 1].id 
						routeid = journeyArr[0].routeid
						lineid = journeyArr[0].lineid
						fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
						.then(response => {
							return response.json()
						})
						.then(data => {
							time += data.journey_info.journey_time.hours * 60
							time += data.journey_info.journey_time.minutes
						})
					} else if (journeyArr.length === 2){
						startStop = journeyArr[0].stops[0].id
						endStop = journeyArr[0].stops[journeyArr[0].stops.length - 1].id 
						routeid = journeyArr[0].routeid
						lineid = journeyArr[0].lineid
						fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
						.then(response => {
							return response.json()
						})
						.then(data => {
							time += data.journey_info.journey_time.hours * 60
							time += data.journey_info.journey_time.minutes

							//Do second fetch
							startStop = journeyArr[1].stops[0].id
							endStop = journeyArr[1].stops[journeyArr[1].stops.length - 1].id 
							routeid = journeyArr[1].routeid
							lineid = journeyArr[1].lineid
							fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
							.then(response => {
								return response.json()
							})
							.then(data => {
								time += data.journey_info.journey_time.hours * 60
								time += data.journey_info.journey_time.minutes
							})
						})
					} else if (journeyArr.length === 3){
						startStop = journeyArr[0].stops[0].id
						endStop = journeyArr[0].stops[journeyArr[0].stops.length - 1].id 
						routeid = journeyArr[0].routeid
						lineid = journeyArr[0].lineid
						fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
						.then(response => {
							return response.json()
						})
						.then(data => {
							time += data.journey_info.journey_time.hours * 60
							time += data.journey_info.journey_time.minutes

							//Do second fetch
							startStop = journeyArr[1].stops[0].id
							endStop = journeyArr[1].stops[journeyArr[1].stops.length - 1].id 
							routeid = journeyArr[1].routeid
							lineid = journeyArr[1].lineid
							fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
							.then(response => {
								return response.json()
							})
							.then(data => {
								time += data.journey_info.journey_time.hours * 60
								time += data.journey_info.journey_time.minutes

								//Do third fetch
								startStop = journeyArr[2].stops[0].id
								endStop = journeyArr[2].stops[journeyArr[1].stops.length - 1].id 
								routeid = journeyArr[2].routeid
								lineid = journeyArr[2].lineid
								fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
								.then(response => {
									return response.json()
								})
								.then(data => {
									time += data.journey_info.journey_time.hours * 60
									time += data.journey_info.journey_time.minutes
								})

							})
						})
					}

					//Must adjust stops to remove stop that has been passed 
  					let nextStop;
  					for (var l = 0; l < journeyArr.length; l++){
  						if(l === 0  && journeyArr[0].stops.length > 1){
  							//Want to pop off the first stop for first leg
  							journeyArr[0].stops.shift();
  						} else if (l === 1 && journeyArr[0].stops.length === 0 && journeyArr[1].stops.length > 1){
  							//Want to pop off the first stop for second leg
  							journeyArr[1].stops.shift();
  						} else if (l === 2 && journeyArr[1].stops.length === 0 && journeyArr[2].stops.length > 1){
  							//Want to pop off the first stop from the third leg
  							journeyArr[2].stops.shift();
  						}
  					}

  					//Timeout just after the for loop to fetch times and to calculate, shouldn't take this long but safety net
  					setTimeout(()=>{
  						var hours = Math.floor(time / 60);  
						var minutes = time % 60;
						timeLeft.innerHTML = hours + " hour(s) " + minutes + " minutes";
  					},5000)
  				//Bracket is for else after distance to first stop check
				}

				//The actual constant tracking of a user takes place here
				//In a timeout of 20 seconds in case of issues delays with fetches or locating
				//User will never get to next stop on line within 20 seconds
				setTimeout(() => {
					id = navigator.geolocation.watchPosition(
					data => {
					
						if (distanceToStop(data.coords.latitude, data.coords.longitude, desiredStop.lat, desiredStop.long) < 100
							&& nextStopList.length < 3){
							document.getElementById('selectedTrip').style.display='none';
							document.getElementById('tripInfo').style.display='none';
							//document.getElementById('end').style.display='none';
							let completeinnerHTML = "";
							completeinnerHTML += '<p>Wooo, you made it to your stop. See you again soon.</p>'
							document.getElementById('tripcompleteimage').style.display = 'block';
							document.getElementById('tripcompletecontent').innerHTML = completeinnerHTML;
						}

						else if (distanceToStop(data.coords.latitude, data.coords.longitude, nextStopList[1].lat, nextStopList[1].long) < 100){
							//Shift before displaying so don't display stops already visited
							nextStopList.shift();
							innerHTML = "";
							for(let k =0; k< nextStopList.length; k++){
	  							if(k === 1){
	  								innerHTML += "<p> <span class='nextStop'> Next Stop: </span> " + nextStopList[k].name + "<p>"
	  							} else {
	  								innerHTML += "<p>" + nextStopList[k].name + "<p>"
	  							}
	  						}
	  						upcomingStops.innerHTML = innerHTML;
	  						//Remove first element from list
	  						stopsLeft.innerHTML = nextStopList.length;
	  						//Calcu;ate distance to desired stops
	  						distancetoend = distanceToStop(nextStopList[0].lat, nextStopList[0].long, desiredStop.lat, desiredStop.long)
	  						roundedDistance = (distancetoend / 1000).toFixed(2)
	  						distanceLeft.innerHTML = roundedDistance + "km"
	  						timeLeft.innerHTML = "Loading"
	  						//Don't want time predictions for last 3 stops
	  						if(nextStopList.length < 4){
	  							document.getElementById('timeLeftP').innerHTML = "<h6 class='pinkspan'> YOUR STOP IS APPROACHING </h6>"
	  							//nextStopList.shift()
	  						}
	  						else{
		  						//estimatedArrival.innerHTML = "Loading"
		  						let day = new Date();
		  						hours = day.getHours()
								mins = day.getMinutes()
								seconds = ((hours * 3600) + (mins * 60))

		  						time = 0;
		  						if (journeyArr.length === 1){
									startStop = journeyArr[0].stops[0].id
									endStop = journeyArr[0].stops[journeyArr[0].stops.length - 1].id 
									routeid = journeyArr[0].routeid
									lineid = journeyArr[0].lineid
									fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
									.then(response => {
										return response.json()
									})
									.then(data => {
										time += data.journey_info.journey_time.hours * 60
										time += data.journey_info.journey_time.minutes
									})
								}else if (journeyArr.length === 2){
									startStop = journeyArr[0].stops[0].id
									endStop = journeyArr[0].stops[journeyArr[0].stops.length - 1].id 
									routeid = journeyArr[0].routeid
									lineid = journeyArr[0].lineid
									fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
									.then(response => {
										return response.json()
									})
									.then(data => {
										time += data.journey_info.journey_time.hours * 60
										time += data.journey_info.journey_time.minutes

										//Do second fetch
										startStop = journeyArr[1].stops[0].id
										endStop = journeyArr[1].stops[journeyArr[1].stops.length - 1].id 
										routeid = journeyArr[1].routeid
										lineid = journeyArr[1].lineid
										fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
										.then(response => {
											return response.json()
										})
										.then(data => {
											time += data.journey_info.journey_time.hours * 60
											time += data.journey_info.journey_time.minutes
										})
									})
								} else if (journeyArr.length === 3){
									startStop = journeyArr[0].stops[0].id
									endStop = journeyArr[0].stops[journeyArr[0].stops.length - 1].id 
									routeid = journeyArr[0].routeid
									lineid = journeyArr[0].lineid
									fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
									.then(response => {
										return response.json()
									})
									.then(data => {
										time += data.journey_info.journey_time.hours * 60
										time += data.journey_info.journey_time.minutes

										//Do second fetch
										startStop = journeyArr[1].stops[0].id
										endStop = journeyArr[1].stops[journeyArr[1].stops.length - 1].id 
										routeid = journeyArr[1].routeid
										lineid = journeyArr[1].lineid
										fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
										.then(response => {
											return response.json()
										})
										.then(data => {
											time += data.journey_info.journey_time.hours * 60
											time += data.journey_info.journey_time.minutes

											//Do third fetch
											startStop = journeyArr[2].stops[0].id
											endStop = journeyArr[2].stops[journeyArr[1].stops.length - 1].id 
											routeid = journeyArr[2].routeid
											lineid = journeyArr[2].lineid
											fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeid+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
											.then(response => {
												return response.json()
											})
											.then(data => {
												time += data.journey_info.journey_time.hours * 60
												time += data.journey_info.journey_time.minutes
											})

										})
									})
								}

								for(var q =0; q<journeyArr.length; q++){
									if(l === 0  && journeyArr[0].stops.length > 1){
			  							//Want to pop off the first stop for first leg
			  							journeyArr[0].stops.shift();
			  						} else if (l === 1 && journeyArr[0].stops.length === 0 && journeyArr[1].stops.length > 1){
			  							//Want to pop off the first stop for second leg
			  							journeyArr[1].stops.shift();
			  						} else if (l === 2 && journeyArr[1].stops.length === 0 && journeyArr[2].stops.length > 1){
			  							//Want to pop off the first stop from the third leg
			  							journeyArr[2].stops.shift();
			  						}	
								}

								//Timeout just after the for loop to fetch times and to calculate, shouldn't take this long but safety net
			  					setTimeout(()=>{
			  						var hours = Math.floor(time / 60);  
									var minutes = time % 60;
									timeLeft.innerHTML = hours + " hour(s) " + minutes + " minutes";
			  					},5000)
		  					//Bracket here is for the time calculations
		  					}
		  				//Bracket here is for if reached next stop
						}

					//Bracket for user tracking
					})

				//Bracket for the tracking of the user timeout
				},20000)

			//Bracket for if(geolocation in navigtor)	
			}

  		},5000)
  	}

  	getJourneyLegsAwait();

	//Additional error handler in case error in finding location
	setTimeout(()=>{
		if(gettingLocationVar === true){
			document.getElementById('gettingLocation').style.display="none";
			document.getElementById('cantfindlocation').style.display='block';
		}
	},15000)
}

document.getElementById('end').addEventListener('click', () =>{
	document.getElementById('selectedTrip').style.display='none';
	document.getElementById('tripInfo').style.display='none';
	document.getElementById('end').style.display='none';
	document.getElementById('tripcompleteimage').style.display = 'none';
	document.getElementById('tripcompletecontent').style.display = 'none';
	getJourneyAwait();
	//Resets the map to remove the plotted route, ttimeout allows saved journeys to load back in quickly
	setTimeout(()=>{
		initMap();
	},3000)
})

function removeTrip(primarykey){
	fetch(`http://127.0.0.1:8000/api/plannedjourney/destroy/${primarykey}` ,{
		method: 'DELETE',
		credentials: "same-origin",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
	})
	.then(res => console.log("Success", res))
	.catch(err => console.log("Error", err));
    getJourneyAwait();
    getJourneyAwait();
}