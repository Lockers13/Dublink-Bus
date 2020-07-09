let autocomplete;
function initAutocomplete(){
	autocomplete = new google.maps.places.Autocomplete(
		document.getElementById('autocomplete'),
		{
			types:['address'],
			componentRestrictions:{'country':['IE']},
			field:['address_component','adr_address','formatted_address','name']
		}
	);
	autocomplete = new google.maps.places.Autocomplete(
		document.getElementById('autocomplete2'),
		{
			types:['address'],
			componentRestrictions:{'country':['IE']},
			field:['address_component','adr_address','formatted_address','name']
		}
	);
}

function initialize(){
	initMap()
	initAutocomplete()
}