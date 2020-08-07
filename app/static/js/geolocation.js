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
            routes.push(route[0]);
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
    	var line = routes[i].Line
    	var tripID = routes[i].savedTripID
    	var routeNumber = i + 1
    	for(var q = 0; q < stops_import.length; q++){
    		if (routes[i]['Departure Stop'] === stops_import[q].id){
    			var startStation = stops_import[q].name
    		}
    		if (routes[i]['Arrival Stop'] === stops_import[q].id){
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


//Route should be the object created from the getRoute function
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

	let lineid = route.Line
	let startStop = route['Departure Stop']
	let endStop = route['Arrival Stop']
	let routeID = route['Route ID']
	let savedTripID = route['savedTripID']
	//ID WILL BE USED TO DELETE THE JOURNEY ONCE THE JOUREY HAS BEEN COMPLETE



	let day = new Date();
	
	//nextStopList containes all remaining stops, first stop popped off once has been
	let nextStopList = []
	let upcomingStops = document.getElementById('upcomingStops');
	//let estimatedArrival = document.getElementById('estimatedArrival');
	let timeLeft = document.getElementById('timeLeft');
	let stopsLeft = document.getElementById('stopsLeft');
	let distanceLeft = document.getElementById('distanceLeft');
	let innerHTML = "";

	//Do the fetching of the stop info first
	fetch("http://localhost:8000/routes/api/routemaps/?lineid="+lineid+"&start="+startStop+"&end="+endStop+"&routeid="+routeID)
		.then(response => {
			return response.json();
		})
		.then(data => {
			console.log("Fetched stops: ", data)
			if('geolocation' in navigator) {
			   		gettingLocationVar = false;
			   	//This gets the users current locations, once off to ensure they are within the correct distance of start stop
  					document.getElementById('gettingLocation').style.display="none";
  					document.getElementById('tripmessage').style.display='grid';
  					//Plot markers expect route object inside array
  					var routeArr = []
  					routeArr.push(route)
  					initMap(routeArr)

  					if (distanceToStop(currentLat, currentLong, data[0].lat, data[0].long) > 100000){
  						console.log("Too far from first stop")
  						document.getElementById('toofar').style.display = "block";
  						document.getElementById('tripmessage').style.display = 'none';
  						//Want to end functon in this case
  						return;
  						console.log("Still running")
  					}

  					//This ensures that the user is within at least 250 meters of stop, 250 gives us room for error
  					else{
  						//Display the upcoming stops and information
  						console.log("Should be changing visibility")
  						document.getElementById('tripmessage').style.display="none";
						document.getElementById('selectedTrip').style.display='block';
						document.getElementById('tripInfo').style.display='block';
						document.getElementById('end').style.display='block';
						stopsLeft.innerHTML = data.length;
						let index = data.length - 1;
						let distancetoend = distanceToStop(data[0].lat, data[0].long, data[index].lat, data[index].long)
						let roundedDistance = (distancetoend / 1000).toFixed(2)
						distanceLeft.innerHTML = roundedDistance + " KM"
  						//Loop over and display data
  						for(let j =0; j< data.length; j++){
  							if(j === 0){
  								innerHTML += "<p>" + data[j].name + "<p>"
  							}
  							else if(j === 1){
  								innerHTML += "<p> <span class='nextStop'> Next Stop: </span> " + data[j].name + "<p>"
  								nextStopList.push(data[j])
  							} else {
  								innerHTML += "<p>" + data[j].name + "<p>"
								nextStopList.push(data[j])
  							}
  						}
  						upcomingStops.innerHTML = innerHTML;
  						timeLeft.innerHTML = "Loading";
  						//estimatedArrival.innerHTML = "Loading";

  						//Run the predictive model here, the updated time will therefore take a second longer to display
  						fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeID+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
  						.then(response => {
  							return response.json()
  						})
  						.then(data => {
  							console.log(data.journey_info.arrival_endstop.minutes.length)
  							if(data.journey_info.arrival_endstop.minutes.length < 2){
  								//estimatedArrival.innerHTML =  data.journey_info.arrival_endstop.hours + ": 0" + data.journey_info.arrival_endstop.minutes
  							} else {
  								//estimatedArrival.innerHTML =  data.journey_info.arrival_endstop.hours + ":" + data.journey_info.arrival_endstop.minutes
  							} 
  							if (data.journey_info.journey_time.hours > 0){
  								timeLeft.innerHTML = data.journey_info.journey_time.hours + " H " + data.journey_info.journey_time.minutes + " M"
  							} else {
  								timeLeft.innerHTML = data.journey_info.journey_time.minutes + " Minutes"
  							}
  						})
  					} 

			//Error handling if geolocation is not working
			} else {
  				document.getElementById('tripmessage').innerHTML = "Sorry, looks like geolocation tracking is not enabled on this device. Please enable tracking or change to a compatible device for tracking."
  				//Want to end function in this case
  				return null
			}



			//Fetch the most up to date prediction for the arrival times
			fetch("http://localhost:8000/routes/api/predict/?lineid="+lineid+"&start_stop="+startStop+"&end_stop="+endStop+"&routeid="+routeID+"&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
			.then(response => {
				return response.json()
			})
			.then(data => {
				console.log(data)
				let minutes = [0,1,2,3,4,5,6,7,8,9]
				if(minutes.includes(data.journey_info.arrival_endstop.minutes)){
					//estimatedArrival.innerHTML =  data.journey_info.arrival_endstop.hours + " : 0" + data.journey_info.arrival_endstop.minutes
				} else {
					//estimatedArrival.innerHTML =  data.journey_info.arrival_endstop.hours + ":" + data.journey_info.arrival_endstop.minutes
				} 
				if (data.journey_info.journey_time.hours > 0){
					timeLeft.innerHTML = data.journey_info.journey_time.hours + " H " + data.journey_info.journey_time.minutes + " M"
				} else {
					timeLeft.innerHTML = data.journey_info.journey_time.minutes + " Minutes"
				}
			})

			console.log("nextstoplist: ", nextStopList);
			
			//The actualt constant tracking of a user takes place here
			//In a timeout of 20 seconds in case of issues delays with fetches or locating
			//User will never get to next stop on line within 20 seconds
			setTimeout(() => {
				id = navigator.geolocation.watchPosition(
				data => {
					let index = nextStopList.length - 1;
					
					if (distanceToStop(data.coords.latitude, data.coords.longitude, nextStopList[index].lat, nextStopList[index].long) < 100
						&& nextStopList.length < 3){
						console.log("Reached the end")
						document.getElementById('selectedTrip').style.display='none';
						document.getElementById('tripInfo').style.display='none';
						//document.getElementById('end').style.display='none';
						let completeinnerHTML = "";
						completeinnerHTML += '<p>Wooo, you made it to your stop. See you again soon.</p>'
						document.getElementById('tripcompleteimage').style.display = 'block';
						document.getElementById('tripcompletecontent').innerHTML = completeinnerHTML;

					}
					
					//Functionality for reaching the next stop on the list
					else if (distanceToStop(data.coords.latitude, data.coords.longitude, nextStopList[0].lat, nextStopList[0].long) < 100){
						console.log("Reached next stop")
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
  						//let index = nextStopList.length - 1;
  						distancetoend = distanceToStop(nextStopList[0].lat, nextStopList[0].long, nextStopList[index].lat, nextStopList[index].long)
  						roundedDistance = (distancetoend / 1000).toFixed(2)
  						distanceLeft.innerHTML = roundedDistance + "km"
  						timeLeft.innerHTML = "Loading"
  						console.log(nextStopList.length);
  						if(nextStopList.length < 4){
  							document.getElementById('timeLeftP').innerHTML = "<h6 class='pinkspan'> YOUR STOP IS APPROACHING </h6>"
  							nextStopList.shift()
  						}
  						else{
	  						//estimatedArrival.innerHTML = "Loading"
	  						hours = day.getHours()
							mins = day.getMinutes()
							seconds = ((hours * 3600) + (mins * 60))
	  						fetch("http://localhost:8000/routes/api/predict/?lineid=14&start_stop="+nextStopList[0].id+"&end_stop="+nextStopList[index].id+"&routeid=14_16&time_secs="+seconds+"&temp="+temp+"&rain=0.16&dow="+dayNum)
	  						.then(response => {
	  							return response.json()
	  						})
	  						.then(data => {
	  							let minutes = [0,1,2,3,4,5,6,7,8,9]
								if (data.journey_info.journey_time.hours > 0){
									timeLeft.innerHTML = data.journey_info.journey_time.hours + " H " + data.journey_info.journey_time.minutes + " M"
								} else {
									timeLeft.innerHTML = data.journey_info.journey_time.minutes + " Minutes"
								}
	  						})
	  						nextStopList.shift()
	  						console.log("List after shift: ", nextStopList)
	  					}
					}
				},
				//Second arg is for errors
				error => console.log(error),
				//Third arg is for options
				{
				enableHighAccuracy: true
				});
			}, 5000);
	})

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
	//This resets the map so the current journey is no longer plotted on it
	initMap()
	getJourneyAwait();
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