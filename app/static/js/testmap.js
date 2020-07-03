// Initialize and add the map
var url = 'http://localhost:5000/api/coordinates';

function initMap(data) {
    return fetch(url)
        .then(response => response.json())
        .then(function (data) {
            var dublin = {
                lat: 53.3498,
                lng: -6.2603
            };
            var map = new google.maps.Map(
                document.getElementById('map'), {
                    zoom: 14,
                    center: dublin,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });


            var infowindow = new google.maps.InfoWindow();
            var marker;
            var image = { url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' };

            var markerList = []
            var coord_len = data.coordinates.length;
            for (var i = 0; i < coord_len; i++) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data.coordinates[i].lat, data.coordinates[i].lng),
                    map: map,
                    icon: image,
                    shape: shape,
                    title: data.coordinates[i].name
                });
                markerList.push(marker)


                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infowindow.setContent(data.coordinates[i].num + ": " + data.coordinates[i].name + ". Available Bikes: " + data.coordinates[i].bikes + ". Available Stands: " + data.coordinates[i].stands);
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            }

            /* Code for search bar functionality begins here*/

            const inputBox = document.getElementById('stationtextbox');

            function findStation() {
                var station = inputBox.value;
                //alert(station);
                for (i = 0; i < markerList.length; i++) {
                    if (station == markerList[i].title) {
                        infowindow.setContent(data.coordinates[i].num + ": " + data.coordinates[i].name + ". Available Bikes: " + data.coordinates[i].bikes + ". Available Stands: " + data.coordinates[i].stands);
                        infowindow.open(map, markerList[i]);
                    }
                }
            }

            //Allows input box to be executed with enter key
            inputBox.addEventListener("keyup", function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    findStation();
                }
            });

            /* Code for search bar functionality ends here */

        });
}