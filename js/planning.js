//https://www.sitepoint.com/google-maps-javascript-api-the-right-way/
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelectorAll('#markermap').length > 0)
  {
    if (document.querySelector('html').lang)
      lang = document.querySelector('html').lang;
    else
      lang = 'en';

    var js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?key=&callback=initMap&signed_in=true&language=' + lang;
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});

var map;
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var markers = [];
var markerBounds = [];
var totalKm = 0;
var florida = {
    lat: 27.349,
    lng: -81.453
};

function initMap() {
    var geocoder = new google.maps.Geocoder;
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var responses = new Array();
    var bounds = new google.maps.LatLngBounds();
    for(i=0;i<markers.length;i++) {
     bounds.extend(markers[i].getPosition());
  }






    map = new google.maps.Map(document.getElementById('markermap'), {
        center: florida,
        zoom: 7
    });

    document.getElementById("button").addEventListener("click", function(){
        geocodeAddress(geocoder, map);
    });

    // This event listener calls addMarker() when the map is clicked.
    google.maps.event.addListener(map, 'click', function(event) {
        var marker = addMarker(event.latLng, map);
        var myLatLng = new google.maps.LatLng({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        });
        geocodeMarker(geocoder, myLatLng);
        markers.push(marker);
        markerBounds.push(marker);
        //console.log("Number of Markers in the Array:" + markers.length);
        //console.log(markers[0] + markers[1]);
        directionsDisplay.setMap(map);




        part = 0;

        if (markers.length > 1) {

            calculateAndDisplayRoute(directionsService, directionsDisplay, markers, part, function(legDistance) {
                responses.push(legDistance);
                totalKm = (totalKm + responses[0]/1000);
                console.log("totalkm = " + totalKm + " km");
console.log(bounds);
            });
            console.log("Response length is:" + responses.length);

            markers.shift();
        }
    });
}

//search for input and set the map to the first result
function geocodeAddress(geocoder, resultsMap) {
var address = document.getElementById('destInput').value;
geocoder.geocode({'address': address}, function(results, status) {
  if (status === 'OK') {
    resultsMap.setCenter(results[0].geometry.location);
    resultsMap.setZoom(7);
    // var marker = new google.maps.Marker({
    //   map: resultsMap,
    //   position: results[0].geometry.location
    // });
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
});
}


//lookup address on placed marker
function geocodeMarker(geocoder, location) {
    var myLatLng1 = new google.maps.LatLng({
        lat: location.lat(),
        lng: location.lng(),
    });
    geocoder.geocode({
        'location': myLatLng1
    }, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                console.log(results[0].formatted_address);
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}


// Adds a marker to the map.
function addMarker(location, map) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    var marker = new google.maps.Marker({
        position: location,
        label: labels[labelIndex++ % labels.length],
        map: map,
        draggable: false,
        animation: google.maps.Animation.DROP
    });

    return location
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, markers, part, callback) {
    directionsService.route({
        origin: markers[part],
        destination: markers[part + 1],
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            renderDirections(response);

            callback(response.routes[0].legs[0].distance.value * 1.609344);
            //directionsDisplay.setDirections(response);
            console.log(response.routes[0].legs[0].distance.value * 1.609344);
            $("#leg").append("<li>" +  Math.round(response.routes[0].legs[0].distance.value / 1000  ) + "Km" + "</li>");
            $("#travelTime").append("<li>" + response.routes[0].legs[0].duration.text + "</li>");
            $("#section").append("<li>" + "From : " + labels[labelIndex - 2] + " to " + labels[labelIndex-1]   + "</li>" );


            console.log("labelIndex = "+ labels[labelIndex]);
            console.log(response);

        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
// create object for partial route between markers  &c
function renderDirections(result) {
    var directionsRenderer = new google.maps.DirectionsRenderer;
    directionsRenderer.setMap(map);
    directionsRenderer.setDirections(result);

}
