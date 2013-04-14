Dublin Bring Banks
==================
Web based app to locate and get directions to bring banks/recycling centres in South Dublin and Fingal County Councils.
Live demo [here](http://madd-ca2.azurewebsites.net).

Features
--------
1. Uses the users location to locate them on google maps.
2. Reads a list of bring bank location data and adds markers to the map.
3. User can select a location to get directions to and details about the selected location.

Issues
------
Had to use .js extension instead of .json when hosting on azure websites. This was because the free sites do not have
the mime type configured for json.

Tried to use [Distance Matrix Service](https://developers.google.com/maps/documentation/javascript/distancematrix) but
it only allows 25 points per call and has a low usage limit. I ended up having to implement client side distance
calculations using the method described [here](http://www.movable-type.co.uk/scripts/latlong.html).

Future Work
-----------
1. Add a list view sorted by distance for all bring banks which can be selected from to display details and directions.
2. Refactor JS to be more modular.
3. Update marker icon and fade out non selected markers to make it easier to see route
4. Unit tests
5. Perf testing

