let currentLocation;

if('geolocation' in navigator) {
 //This simply gets the users location when the pages loads
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
	id = navigator.geolocation.watchPosition(
		//First arg is for success
		data => {
			console.log("Tracking");
			distanceToStop(data.coords.latitude, data.coords.longitude, 53.2794027289323, -6.27041174873558)
		},
		//Second arg is for errors
		error => console.log(error),
		//Third arg is for options
		{
			enableHighAccuracy: true
		}
	);
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
	//Checking if stop is within half a km, give notification then. 
	if(distance <= 500){
		alert("Your stop is coming up soon")
	}
	//End tracking when within 100 meters
	//Should validate the users CO2 points here
	if (distance <= 100){
		navigator.geolocation.clearWatch(id);
		console.log("Tracking ended");
	}
	console.log(distance)
}

function validateCO2Points(){
	//pass
}

function startJourney(startLat, startLng, destinationLat, destinationLon){
	
	//Check users distance from the start stop.
		//If within 100 meters start journey
		//Else notify that start location is too far

	//Track distance

	//If gets close enough to destination
		//Notify of stop coming up
		//End tracking
		//Calculate CO2 points -- Do need to validate that is connected to dublin bus wifi?

	//If end journey clicked
		//End tracking
		//Calculate CO2 points
}

