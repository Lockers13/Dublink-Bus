import React, {useState} from 'react';
import {GoogleMap, withScriptjs, withGoogleMap, Marker, InfoWindow } from 'react-google-maps';
//import * as staticStops from '../components/static_stops.json'
//import mapStyles from '../components/mapStyle'
import Map from '../components/Map'

const WrappedMap = withScriptjs(withGoogleMap(Map));

export default function App(){

	return (
				<div style={{width: '50vw', height: '80vh'}}> 
					<WrappedMap 
					googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBTqQ5XI6Z3N5j26PNXbFKUxUFfq8dnGV8`} 
					loadingElement = {<div style={{ height: "100%" }} />}
					containerElement = {<div style={{ height: "100%" }} />}
					mapElement = {<div style={{ height: "100%" }} />}
					/> 
				</div>
			)
}