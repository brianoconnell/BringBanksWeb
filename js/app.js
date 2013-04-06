var geocoder;
var userLocation = {};
var map = {};
var boolToStringOptions = {"trueString":"Yes", "falseString":"No"};

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
    $details.append("<div>" + locationInfo.location.area + "</p>");
    $details.append("<div>Cans: " + boolToString(locationInfo.cans, boolToStringOptions) + "</div>");
    $details.append("<div>Plastics: " + boolToString(locationInfo.plastic, boolToStringOptions) + "</div>");
    $details.append("<div>Glass: " + boolToString(locationInfo.glass, boolToStringOptions) + "</div>");
    $details.append("<div>Textiles: " + boolToString(locationInfo.textiles, boolToStringOptions) + "</div>");
}

function boolToString(val, options){

    var falseString = options.falseString || "False";
    if(val === null || val === 'undefined'){
        return falseString;
    }

    var trueString = options.trueString || "True";
    return val ? trueString : falseString;
}