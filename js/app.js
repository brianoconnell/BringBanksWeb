var trackerId = 0;
var geocoder;
var userLocation = {};
var map = {};
$(function(){
    geocoder = new google.maps.Geocoder();
    if(navigator.geolocation){
        var gps = navigator.geolocation;
        gps.getCurrentPosition(function(pos){
            var latLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            var opts = {zoom:12, center:latLong, mapTypeId: google.maps.MapTypeId.ROADMAP};
            map = new google.maps.Map(document.getElementById("map_canvas"), opts);
            userLocation = new google.maps.Marker({
                position: latLong,
                map: map,
                title: "You!"
            });
            showLocation(pos);
        });

        trackerId = gps.watchPosition(function(pos){
            var latLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            map.setCenter(latLong);
            userLocation.setPosition(latLong);
            showLocation(pos);
        });
    }
});

function showLocation(pos) {
    var latLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    if(geocoder) {
        geocoder.geocode({'latLng':latLong}, function(results, status){
            if(status == google.maps.GeocoderStatus.OK) {
                if(results[1]) {
                    $("location").innerHTML = results[1].formatted_address;
                }
            }
        });
    }
}