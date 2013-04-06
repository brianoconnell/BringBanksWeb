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

            populateMarkers(map);
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

var mapData;
function populateMarkers(map) {
    $.getJSON("data/data.json", function(data){
        console.log("Success");
        mapData = data;
        $.each(data, function(index){
            var latLong = new google.maps.LatLng(this.location.latitude, this.location.longitude);
            var pinLocation = new google.maps.Marker({
                position: latLong,
                map: map,
                title: this.location.area
            });
            pinLocation.hotspotid = index;
            google.maps.event.addListener(pinLocation, "click", onMarkerClick)
        })
    }).fail(function(jqXhr, textStatus, error){
            var err = textStatus + ", " + error;
            console.log("Failure: " + err)
        });
}

function onMarkerClick() {
    var locationInfo = mapData[this.hotspotid];
    var $details = $("#details");
    $details.empty();
    $details.append("<p>" + locationInfo.location.area + "</p>");
    $details.append("<p>Cans: " + locationInfo.cans + "</p>");
    $details.append("<p>Plastics: " + locationInfo.plastic + "</p>");
    $details.append("<p>Glass: " + locationInfo.glass + "</p>");
    $details.append("<p>Textiles: " + locationInfo.textiles + "</p>");
}