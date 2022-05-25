// Used for directions.
let directionsLayerGroup = L.layerGroup().addTo(map);
directionsLayerGroup.setZIndex(3);
let directionsArr = [];


// Directions class.
class GeojsonDirections {
    /**
     * Creating a GeoJSON object containing a route.
     * @param name: properties.name of the GeoJSON object.
     * @param routesArr: Array containing the route.
     */
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

    /**
     * Adds this objects route to the map.
     */
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


/**
 * Connecting the end, and start, of a route, to the waypoints.
 * @param startCoordArr: Array containing the starting coordinates of the route
 * and the starting waypoint.
 * @param endCoordArr: Array containing the end coordinates of the route
 * and the ending waypoint.
 */
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


/**
 * Fetching directions from the Mapbox Directions API. When the directions have been fetched they are
 * added to the map.
 * @param startCoordsArr: Array containing the first coordinate of the route.
 * @param endCoordsArr: Array containing the last coordinate of the route.
 */
async function getDirections(startCoordsArr, endCoordsArr) {
    if (usrWPCollection.length > 1) {
        fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoordsArr};` +
            `${endCoordsArr}?steps=true&geometries=geojson&overview=full&` +
            `access_token=${MAPBOX_ACCESS_TOKEN}`,
            {method: 'GET'})
            .then(response => {
                if (!response.ok) {
                    throw new Error(rensponse.statusText, response.status);
                }

                return response.json();
            })
            .then(route => {
                let routeData = route.routes[0].geometry.coordinates;

                // Adding the distance from the new route to total distance.
                addDistanceFromRouteArr(routeData);

                // Adding the new route to the map.
                let directions = new GeojsonDirections(route.waypoints[0].name,
                    routeData);
                directions.addToMap();

                // Connecting the ends.
                let routeStart = routeData[0];
                let routeEnd = routeData.at(-1);
                connectEnds([startCoordsArr, routeStart], [endCoordsArr, routeEnd]);


            })
            .catch(e => {
                if (e.message.indexOf('NetworkError') !== -1) {
                    displayUsrErr(e,
                        'Network error: Please check your internet connection.');
                } else {
                    console.log(e);
                }
            });
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
