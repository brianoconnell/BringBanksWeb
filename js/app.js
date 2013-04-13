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
    $.getJSON("data/data.js").success(function (data) {
        // console.log("Success");
        mapData = data;
        setClosestBringBanks(userLocation.position, 10);
        $.each(closestBanks, function (index) {
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
    directionsService.route(directionsRequest, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setMap(null);
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(result);
            var directionsPanel = document.getElementById("directions-panel");
            directionsPanel.innerHTML = "";
            directionsDisplay.setPanel(directionsPanel);
        }
    });
}

var closestBanks = [];
function setClosestBringBanks(currentLocation, maxClosest)
{
    var maxItems = maxClosest || 5;
    var origin = {latitude:currentLocation.lat(), longitude: currentLocation.lng()};
    for(var i = 0; i < mapData.length; i++) {
        mapData[i].distanceToOrigin =
            calculateDistance(origin, {latitude: mapData[i].location.latitude, longitude: mapData[i].location.longitude});
    }
    closestBanks = mapData.sort(function(a, b) {
        // Sort results by nearest to furthest
        return a.distanceToOrigin - b.distanceToOrigin;
    }).slice(0, maxItems);
}

function onMarkerClick() {
    var locationInfo = closestBanks[this.hotspotid];
    var $details = $("#details");
    $details.empty();
    var newDetails = [];
    newDetails.push("<div>" + locationInfo.location.area + "</div>");
    newDetails.push("<div>Cans: " + boolToString(locationInfo.cans, boolToStringOptions) + "</div>");
    newDetails.push("<div>Plastics: " + boolToString(locationInfo.plastic, boolToStringOptions) + "</div>");
    newDetails.push("<div>Glass: " + boolToString(locationInfo.glass, boolToStringOptions) + "</div>");
    newDetails.push("<div>Textiles: " + boolToString(locationInfo.textiles, boolToStringOptions) + "</div>");
    $details.append(newDetails.join(""));

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

// Adapted from http://www.movable-type.co.uk/scripts/latlong.html
function calculateDistance(origin, target) {
    const EARTH_RADIUS = 6371; // Kilometers

    var deltaLatitude = degreesToRadians(target.latitude - origin.latitude);
    var deltaLongitude = degreesToRadians(target.longitude - origin.longitude);
    var originLatitudeInRadians = degreesToRadians(origin.latitude);
    var targetLatitudeInRadians = degreesToRadians(target.latitude);

    var a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude * 2) +
            Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude * 2) *
            Math.cos(originLatitudeInRadians) * Math.cos(targetLatitudeInRadians);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c; // distance in kilometers
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

