var favouriteStops = []

//api/favstop should only return fav stops for the current user
fetch("api/favstop/")
    .then(response => {
        return response.json();
    })
    .then(data => {
        for(var i = 0; i < data.length; i++){
        	favouriteStops.push(data[i].stopid)
        }
    })


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

			var marker = new google.maps.Marker({
				position: coords,
				map:map,
				icon: icon,
				scaledSize: new google.maps.Size(1, 1),
				name:stop.name,
				id:stop.id
			})

			var infoWindow = new google.maps.InfoWindow({
            	content: marker.name + '<br>' + '<button htmlType="submit" onClick=addFavStop()> Add Stop As Favourite </button>'
          	});

          	marker.addListener('click', function(){
	        	infoWindow.open(map, marker);
	        });

		}

		//Adding markers for each stop
		for(var i = 0;i < stops_import.length;i++){
        	addMarker(stops_import[i]);
      	}
	}