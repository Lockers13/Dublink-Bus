//stopNames coming from static_stops.js


//Use of jquery and jqueryui here
$( function() {
    $( "#stoptextbox" ).autocomplete({
      source: stopNames
    });
  } );