function map_route() {
	clearOverlays()
	var lineid = this.value
	console.log(lineid)
	fetch("http://127.0.0.1:8000/routes/api/routemaps?lineid=" + lineid)
	.then(response => response.json())
	.then(function (data) {
		for(var i = 0; i < Object.keys(data).length; i++) { 
			var key = Object.keys(data)[i];
			for(var j = 0; j < data[key].length; j++) {
				try {
					addMarker(data[key][j]);
				}
				catch {
					;
				}
			
				
			}

	
		}
	}
)}