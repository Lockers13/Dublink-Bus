let autocomplete;
function initAutocomplete(){
	autocomplete = new google.maps.places.Autocomplete(
		document.getElementById('startLocation'),
		{
			types:['address'],
			componentRestrictions:{'country':['IE']},
			field:['address_component','adr_address','formatted_address','name']
		}
	);
	autocomplete = new google.maps.places.Autocomplete(
		document.getElementById('endLocation'),
		{
			types:['address'],
			componentRestrictions:{'country':['IE']},
			field:['address_component','adr_address','formatted_address','name']
		}
	);
	autocomplete = new google.maps.places.Autocomplete(
		//For the favourite locations form
		document.getElementById('addAddress'),
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