// Used for directions.
let directionsLayerGroup = L.layerGroup().addTo(map);
directionsLayerGroup.setZIndex(3);
let directionsArr = [];


// Directions class.
class GeojsonDirections {
    constructor(name, routesArr) {
        this.type = "Feature";
        this.properties = {
            "name": name
        };
        this.geometry = {
            "type": "LineString",
            "coordinates": routesArr
        };
    }

    // Adds the route to the map.
    addToMap() {
        let locArr = [this, L.geoJSON(this, {
            pane: 'direction',
            style: {
                interactive: false
            }
        })];

        directionsArr.push(locArr.splice(locArr));

        directionsLayerGroup.addLayer(directionsArr[directionsArr.length - 1][1]);
    }
}


// Connecting the waypoints with the route.
function connectEnds(startCoordArr, endCoordArr) {
    // This constructor like function is created in this scope, because it will only be used in this scope.
    let ConnectEnds = (coordArr) => {
        return {
            'type': 'Feature',
            'properties': {
                'name': 'connectingEnds' + coordArr.toString()
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': coordArr
            }
        };
    }

    // Defining the style of the connecting ends linestring.
    let style = {
        dashArray: [3, 7],
        color: '#cc0000',
        weight: 2,

        fill: true,
        fillColor: '#ef0a0a',
        fillOpacity: 0.8
    };

    // Initiating the start and end.
    let connectStart = ConnectEnds(startCoordArr);
    let connectEnd = ConnectEnds(endCoordArr);

    // Calculating the distance.
    addDistanceFromRouteArr(connectStart.geometry.coordinates);
    addDistanceFromRouteArr(connectEnd.geometry.coordinates);

    // Adding the start to the map
    directionsArr.push([connectStart, L.geoJSON(connectStart, style)]);
    directionsLayerGroup.addLayer(directionsArr[directionsArr.length - 1][1]);

    // Adding the end to the map
    directionsArr.push([connectEnd, L.geoJSON(connectEnd, style)]);
    directionsLayerGroup.addLayer(directionsArr[directionsArr.length - 1][1]);
}

// Fetching the directions.
async function fetchDirections(startCoordsArr, endCoordsArr) {
    let query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoordsArr};${endCoordsArr}?steps=true&geometries=geojson&overview=full&access_token=${mapboxAccessToken}`,
        {method: 'GET'}
    );

    return await query.json();
}


// Requesting directions.
async function getDirections(startCoordsArr, endCoordsArr) {
    if (usrWPCollection.length > 1) {
        let data = await fetchDirections(startCoordsArr, endCoordsArr);
        let route = data.routes[0].geometry.coordinates;

        // Adding the distance to from the new route to total distance.
        addDistanceFromRouteArr(route);

        // Adding the new directions to the map
        let directions = new GeojsonDirections(data.waypoints[0].name, route);
        directions.addToMap();


        // Connecting the ends
        let routeStart = await route[0];
        let routeEnd = await route[route.length - 1];
        connectEnds([startCoordsArr, routeStart], [endCoordsArr, routeEnd]);

    }
}


// Removing directions.
function removeDirections() {
    // Resetting the distance.
    totalDistance = 0;

    // Removing all the layers.
    directionsLayerGroup.clearLayers();

    // Deleting all contents of the array.
    directionsArr.splice(0);
}


// Updating directions.
function updateDirections() {
    // Removing all existing directions.
    removeDirections();

    // Getting new directions.
    if (usrWPCollection.length > 1) {
        for (let i = 1; i < usrWPCollection.length; i++) {
            getDirections(usrWPCollection[i - 1].geoJSON.geometry.coordinates, usrWPCollection[i].geoJSON.geometry.coordinates);
        }
    }
}
