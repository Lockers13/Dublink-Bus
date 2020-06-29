import React, {useState} from 'react';
import {GoogleMap, withScriptjs, withGoogleMap, Marker, InfoWindow } from 'react-google-maps';
import * as staticStops from './static_stops.json'
import mapStyles from './mapStyle'


var favouriteStops = []

//api/favstop should only return fav stops for the current user
fetch("api/favstop/")
    .then(response => {
        return response.json();
    })
    .then(data => {
        for(var i = 0; i<= data.length; i++){
        	favouriteStops.push(data[i].stopid)
        }
    });




export default function Map(){

	const [selectedStop, setSelectedStop] = useState(null);

	return (<GoogleMap defaultZoom={15} defaultCenter={{lat: 53.3477, lng: -6.2800}} defaultOptions={{styles :mapStyles}}>

				{staticStops.stops.map((stop) =>(
						<Marker key={stop.id} position={{lat: stop.lat, lng: stop.long }} onClick={() => {setSelectedStop(stop)}} 
								icon= {{ url: favouriteStops.includes(stop.id) ? "/static/images/favourite.png" : "/static/images/bus-stop.png" , scaledSize: new window.google.maps.Size(
										15, 15)}} />
					)
				)}

		      	{selectedStop && (
		        	<InfoWindow
		          		position={{
		            		lat: selectedStop.lat,
		            		lng: selectedStop.long
		          		}}
		          		onClickClose={() => {
		            		setSelectedStop(null);
		          		}}
		        		>
		          		<div>
		            		<h4>{selectedStop.name}</h4>
		          		</div>
		        	</InfoWindow>
		      	)}

			</GoogleMap>
			);
}