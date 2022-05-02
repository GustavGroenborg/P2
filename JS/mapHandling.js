/************************
 *** GLOBAL VARIABLES ***
 ************************/

/*** Map related ***/
// Access token to the map tiles API.
const mapboxAccessToken = 'pk.eyJ1IjoiZ3VzdGF2Y3JnIiwiYSI6ImNsMHM1amV3MjAzczUzZG81ejNzeTg3dDIifQ.rk9ssli-idSCKtygZjD8og'

// Initiating the map element.
let map = L.map('mapv1').setView([57.0864069, 9.2667862], 13);

// Used for determining which format the coordinates is shown in.
let dmsStatus = true;

// Used for determining whether the user is allowed to add waypoints.
let mapMode = false;

/*** Waypoint related ***/
// The collection of user waypoints.
let usrWPCollection = [];

// User waypoints leaflet layer group.
let usrWPLayerGroup = L.layerGroup();

let wpNo = 0;


/************************
 *** MAP CONSTRUCTION ***
 ************************/

// Constructing the map.
L.tileLayer('https://api.mapbox.com/styles/v1/{style_id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}',
    {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        style_id: 'mapbox/outdoors-v11', //Throws a 404 error, but works anyhow.
        tileSize: 512,
        zoomOffset: -1,
        accessToken: mapboxAccessToken

    }).addTo(map);

// Adding the user waypoint layer group to the map.
usrWPLayerGroup.addTo(map);

/**********************
 *** MOUSE LOCATION ***
 **********************/

/*** Functions ***/

// Converting Decimal Degrees to Degrees-Minutes-Seconds.
function ddToDms(latlngObj) {
    let lat = latlngObj.lat;
    let lng = latlngObj.lng;
    let dms = { lat: {}, lng: {} };

    // TODO: I feel like there is a smarter way around this.
    // Setting DMS latitude
    dms.lat.d = Math.floor(lat);
    dms.lat.m = Math.floor(60 * Math.abs(lat - dms.lat.d));
    dms.lat.s = 3600 * Math.abs(lat - dms.lat.d) - 60 * dms.lat.m;

    // Setting DMS longitude
    dms.lng.d = Math.floor(lng);
    dms.lng.m = Math.floor(60 * Math.abs(lng - dms.lng.d));
    dms.lng.s = 3600 * Math.abs(lng - dms.lng.d) - 60 * dms.lng.m;

    // Fixing north and south, east and west.
    dms.lat.d = Math.abs(dms.lat.d);
    dms.lng.d = Math.abs(dms.lng.d);

    return dms;
}


// Converts latlng obj to a nice-looking string
function latlngToString(latlng) {
    let lat = latlng.lat;
    let lng = latlng.lng;
    let latlngStr, latStr, lngStr;

    if (dmsStatus) {
        let dms = ddToDms(latlng);

        latStr = dms.lat.d.toString() + "\xB0" + " " + dms.lat.m.toString() + "' " + dms.lat.s.toFixed(5).toString() + "\"" + (dms.lat.d > 0 ? "N" : "S");
        lngStr = dms.lng.d.toString() + "\xB0" + " " + dms.lng.m.toString() + "' " + dms.lng.s.toFixed(5).toString() + "\"" + (dms.lng.d > 0 ? "E" : "W");
        latlngStr = latStr + '\u00A0 \u00A0' + lngStr;

        return latlngStr;
    }
    else {
        latStr = latlng.lat.toFixed(5).toString(); // 5 decimals will yield a coordinate precision of 1.11m.
        lngStr = latlng.lng.toFixed(5).toString();
        latlngStr = latStr + ', ' + lngStr;

        return latlngStr;
    }
}



/**********************
 *** USER WAYPOINTS ***
 **********************/

/*** User waypoint class ***/
class UsrGeoJSONWP {
    constructor(WPNo, latlng)
    {
        this.geoJSON = {
            'type': 'Feature',
            'properties': {
                'name': 'usrWP' + WPNo,
                'no': WPNo,
                'latlng': latlng,
                'popupContent': 'This waypoint is located at ' + latlngToString(latlng)
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [latlng.lng, latlng.lat]
            }
        }

        this.html = {
            'idName': 'usrWPCoord' + WPNo
        };

        // Adding the new waypoint to the user waypoint collection.
        usrWPCollection.push(this);
    }

    // Adding the necessary leaflet properties.
    addLeafletProps() {
        // Used for accessing the property within the leaflet methods.
        let self = this;

        this.Leaflet = L.geoJSON(this.geoJSON, {
            pointToLayer: function (feature, latlng) {
                let marker = L.circleMarker(latlng, {
                    radius: 7,
                    fillColor: "#ef0a0a",
                    color: "#cc0000",
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.8
                });

                // Allowing a circle marker to be dragged.
                function circleMarkerDrag(e) {
                    marker.setLatLng(e.latlng);
                    marker.redraw();
                }

                // Preventing the propagation of the click event occurring after the mouse up event.
                function captureClick(e) {
                    // function courtesy of https://codeutility.org/javascript-cancel-click-event-in-the-mouseup-event-handler-stack-overflow/
                    e.stopPropagation();

                    window.removeEventListener('click', captureClick, true);
                }

                // Dragging the marker.
                marker.addEventListener('mousedown', (event) => {
                    // Disabling the possibility to drag the map.
                    map.dragging.disable();

                    // Redrawing the marker to match the current mouse location.
                    map.on('mousemove', circleMarkerDrag);


                });

                // Setting the marker, after it has been dragged.
                marker.addEventListener('mouseup', (event) => {
                    // Prevents the click from propagating and adding a new waypoint.
                    window.addEventListener('click', captureClick, true);

                    marker.setLatLng(event.latlng);

                    // Updating the coordinates in the this.geojson.geometry.coordinates property.
                    let newLatlng = marker.getLatLng();
                    self.geoJSON.geometry.coordinates = [newLatlng.lng, newLatlng.lat];

                    // Removing the event listeners that allows the marker to be dragged.
                    map.off('mousemove', circleMarkerDrag);

                    // Enabling the possibility to drag the map.
                    map.dragging.enable();

                    // Updating the directions.
                    updateDirections();
                });

                // Removing the marker.
                marker.addEventListener('contextmenu', () => {
                    document.querySelector(self.html.id).remove()
                    rmvUsrWP(self);

                    map.dragging.enable();

                    // Updating the directions.
                    updateDirections();
                });

                return marker;
            }
        });
    }
}


/*** Functions ***/

// Toggling the map mode
function toggleMapMode() {
    document.querySelector("#mapModeToggle").style.filter = (mapMode) ? "grayscale(100%)" : "grayscale(0)";

    mapMode = !mapMode;
}

// Adding a new user waypoint.
function addUsrWP(event) {
    if (mapMode === true) {
        // Initiating the new user defined waypoint. Increment wpNo to always ensure a unique waypoint name.
        let usrWP = new UsrGeoJSONWP(wpNo++, event.latlng);

        // Adding the necessary leaflet properties.
        usrWP.addLeafletProps();

        usrWPLayerGroup.addLayer(usrWPCollection[usrWPCollection.length - 1].Leaflet);
        addCoordEl(usrWPCollection[usrWPCollection.length - 1]);

        // Retrieving the directions.
        let usrWPCLength = usrWPCollection.length;
        if (usrWPCLength > 1) {
            getDirections(usrWPCollection[usrWPCLength - 2].geoJSON.geometry.coordinates,
                usrWPCollection[usrWPCLength - 1].geoJSON.geometry.coordinates);
        }

    } else {
        console.log('Something, something the dark side.');
    }
}


// Removing a user determined waypoint
function rmvUsrWP(usrWPObj) {
    // Finding the index of the waypoint.
    let elIdx = usrWPCollection.findIndex((obj) => obj === usrWPObj);

    // Removing the waypoint layer and deleting it from the collection.
    usrWPLayerGroup.removeLayer(usrWPCollection[elIdx].Leaflet);
    usrWPCollection.splice(elIdx, 1);

    // Updating the directions.
    updateDirections();
}



/***********************
 *** EVENT LISTENERS ***
 ***********************/

// Add user waypoint on click.
map.addEventListener('click', addUsrWP);

// Turns on, or off, map mode
document.querySelector('#mapMode').addEventListener('click', toggleMapMode);
