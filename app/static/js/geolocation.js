if('geolocation' in navigator) {
 
 //This simply gets the users location when the pages loads
  navigator.geolocation.getCurrentPosition((position) => {
  	console.log(position.coords);
	});

  //This will change as the users moves, good for updating the map etc. 
 /* const watchID = navigator.geolocation.watchPosition((position) => {
  	doSomething(position.coords.latitude, position.coords.longitude);
	});*/

} else {
  //pass
}

//This will be used to stop watching the users location
//navigator.geolocation.clearWatch(watchID);


const start = document.querySelector("#start");
const stop = document.querySelector("#stop");
var id;

start.addEventListener("click", () =>{
	id = navigator.geolocation.watchPosition(
		//First arg is for success
		data => {
			console.log(data);
		},
		//Second arg is for errors
		error => console.log(error),
		//Third arg is for options
		{
			enableHighAccuracy: true
		}
	);
});

stop.addEventListener("click", () =>{
	navigator.geolocation.clearWatch(id);
});


