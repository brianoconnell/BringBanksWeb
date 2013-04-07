var geocoder;
var userLocation = {};
var map = {};
var boolToStringOptions = {trueString: "Yes", falseString: "No"};

var directionsDisplay = new google.maps.DirectionsRenderer();
$(function () {
    geocoder = new google.maps.Geocoder();
    if (navigator.geolocation) {
        var gps = navigator.geolocation;
        gps.getCurrentPosition(function (pos) {
            var latLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            var opts = {zoom: 12, center: latLong, mapTypeId: google.maps.MapTypeId.ROADMAP};
            map = new google.maps.Map(document.getElementById("map-canvas"), opts);
            userLocation = new google.maps.Marker({
                position: latLong,
                map: map,
                title: "You!"
            });
            showLocation(pos);

            populateMarkers(map);
        });
    }
});

function showLocation(pos) {
    var latLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    if (geocoder) {
        geocoder.geocode({'latLng': latLong}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    $("location").innerHTML = results[1].formatted_address;
                }
            }
        });
    }
}

var mapData;
function populateMarkers(map) {
    $.getJSON("data/data.js",function (data) {
        console.log("Success");
        mapData = data;
        $.each(data, function (index) {
            var latLong = new google.maps.LatLng(this.location.latitude, this.location.longitude);
            var bringBankMarker = new google.maps.Marker({
                position: latLong,
                map: map,
                title: this.location.area
            });
            bringBankMarker.hotspotid = index;
            google.maps.event.addListener(bringBankMarker, "click", onMarkerClick)
        })
    }).fail(function (jqXhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Failure: " + err)
        });
}

function calculateRoute(startLocation, endLocation) {
    var directionsRequest = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.DRIVING
    };

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(directionsRequest, function(result, status) {
       if(status == google.maps.DirectionsStatus.OK) {
           directionsDisplay.setMap(null);
           directionsDisplay.setMap(map);
           directionsDisplay.setDirections(result);
           var directionsPanel = document.getElementById("directions-panel");
           directionsPanel.innerHTML = "";
           directionsDisplay.setPanel(directionsPanel);
       }
    });
}

function onMarkerClick() {
    var locationInfo = mapData[this.hotspotid];
    var $details = $("#details");
    $details.empty();
    $details.append("<div>" + locationInfo.location.area + "</p>");
    $details.append("<div>Cans: " + boolToString(locationInfo.cans, boolToStringOptions) + "</div>");
    $details.append("<div>Plastics: " + boolToString(locationInfo.plastic, boolToStringOptions) + "</div>");
    $details.append("<div>Glass: " + boolToString(locationInfo.glass, boolToStringOptions) + "</div>");
    $details.append("<div>Textiles: " + boolToString(locationInfo.textiles, boolToStringOptions) + "</div>");

    var startLatLong = userLocation.position;
    var endLatLong = new google.maps.LatLng(locationInfo.location.latitude, locationInfo.location.longitude);
    calculateRoute(startLatLong, endLatLong);
    $("#directions").show();
}

function boolToString(val, options) {

    var falseString = options.falseString || "False";
    if (val === null || val === 'undefined') {
        return falseString;
    }

    var trueString = options.trueString || "True";
    return val ? trueString : falseString;
}