let currentLocation;

if('geolocation' in navigator) {
 //This simply gets the users location when the pages loads
 //Used for displaying users current location on page load
  navigator.geolocation.getCurrentPosition((position) => {
  		currentLocation = (position.coords);
	});
} else {
  //pass
}

//This will be used to stop watching the users location
//navigator.geolocation.clearWatch(watchID);


const start = document.querySelector("#start");
const stop = document.querySelector("#stop");
var id;

start.addEventListener("click", () =>{
	console.log("Clicked")
	startJourney()

});

/*stop.addEventListener("click", () =>{
	navigator.geolocation.clearWatch(id);
});*/

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

function validateCO2Points(){
	//pass
}

function startJourney(stopList){
	//Variables for models are dayNum, seconds, currentTemp and currentWeatherDescription

	//Information needed for the model predictions
	let day = new Date();
	//Day should be Mon - Sun ( 0- 6 ) hence the - 1
	let dayNum = day.getDay() - 1;
	let hours = day.getHours()
	let mins = day.getMinutes()
	let seconds = ((hours * 3600) + (mins * 60))
	let currentTemp = weatherList[0].main.temp
	let currentWeatherDescription = weatherList[0].weather[0].main


	

	//nextStopList containes all remaining stops, first stop popped off once has been
	let nextStopList = []
	let upcomingStops = document.getElementById('upcomingStops');
	let estimatedArrival = document.getElementById('estimatedArrival');
	let timeLeft = document.getElementById('timeLeft');
	let stopsLeft = document.getElementById('stopsLeft');
	let distanceLeft = document.getElementById('distanceLeft');
	let innerHTML = "";

	//Do the fetching of the stop info first
	fetch("http://localhost:8000/routes/api/routemaps/?lineid=14&start=4336&end=1072&routeid=14_16")
		.then(response => {
			return response.json();
		})
		.then(data => {
			console.log("Fetched stops: ", data)
			if('geolocation' in navigator) {
			   	
			   	//This gets the users current locations, once off to ensure they are within the correct distance of start stop
  				navigator.geolocation.getCurrentPosition((position) => {
  					console.log(position)

  								//////////////////Want to run the model here/////////////
								////////////// The data from this will update the estimated arrival time and time until arrival //////////////

								///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  					//This ensures that the user is within at least 250 meters of stop, 250 gives us room for error
  					if(distanceToStop(position.coords.latitude, position.coords.longitude, data[0].lat, data[0].long) < 10000){
  						//Display the upcoming stops and information
  						document.getElementById('tripmessage').style.display="none";
						document.getElementById('selectedTrip').style.display='block';
						document.getElementById('tripInfo').style.display='block';
						document.getElementById('end').style.display='block';
						stopsLeft.innerHTML = data.length;
						let index = data.length - 1;
						let distancetoend = distanceToStop(data[0].lat, data[0].long, data[index].lat, data[index].long)
						let roundedDistance = (distancetoend / 1000).toFixed(2)
						distanceLeft.innerHTML = roundedDistance + " KM"
  						console.log(data)
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

  					//Error handling if user is too far from a stop
  					} else {
  						document.getElementById('tripmessage').innerHTML = "Sorry, looks like you are too far from the starting stop to begin this trip. Please start the trip within 100 meters of the starting stop or create a new trip"
  						//Want to end functon in this case
  						return null
  					}
				});
				//Second arg is for errors
				error => console.log(error),
				//Third arg is for options, hgh accuracy is slower but should be fast enough on mobile devices
				{
				enableHighAccuracy: true
				}

			//Error handling if geolocation is not working
			} else {
  				document.getElementById('tripmessage').innerHTML = "Sorry, looks like geolocation tracking is not enabled on this device. Please enable tracking or change to a compatible device for tracking."
  				//Want to end function in this case
  				return null
			}

			console.log("nextstoplist: ", nextStopList);
			
			//The actualt constant tracking of a user takes place here
			//In a timeout of 20 seconds in case of issues delays with fetches or locating
			//User will never get to next stop on line within 20 seconds
			setTimeout(() => {
				console.log("This is the list being used when tracking: ", nextStopList);
				id = navigator.geolocation.watchPosition(
				data => {
					console.log("Tracking");
					//Check the distance to the next stop
					if (distanceToStop(data.coords.latitude, data.coords.longitude, nextStopList[0].lat, nextStopList[0].long) < 100){
						console.log("Reached next stop")
						//////////////////Want to run the model here/////////////
						////////////// The data from this will update the estimated arrival time and time until arrival //////////////
						//Need to update time for the updated model prediction, weather will be same
						hours = day.getHours()
						mins = day.getMinutes()
						seconds = ((hours * 3600) + (mins * 60))
						////////////////////////////////////////////////////////////////////////////////////
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
  						let index = nextStopList.length - 1;
  						distancetoend = distanceToStop(nextStopList[0].lat, nextStopList[0].long, nextStopList[index].lat, nextStopList[index].long)
  						console.log(distancetoend)
  						roundedDistance = (distancetoend / 1000).toFixed(2)
  						distanceLeft.innerHTML = roundedDistance + "km"
  						nextStopList.shift()
  						console.log("List after shift: ", nextStopList)
					}
				},
				//Second arg is for errors
				error => console.log(error),
				//Third arg is for options
				{
				enableHighAccuracy: true
				});
			}, 20000);
	})
}


	///// Run model after each stop //////
	///// Run model from next stop every 5 minutes as a fail safe //////

	//Track distance

	//If gets close enough to destination
		//Notify of stop coming up
		//End tracking
		//Calculate CO2 points -- Do need to validate that is connected to dublin bus wifi?

	//If end journey clicked
		//End tracking
		//Calculate CO2 points





