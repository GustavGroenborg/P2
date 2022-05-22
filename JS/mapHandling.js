/************************
 *** GLOBAL VARIABLES ***
 ************************/

/*** Map related ***/
// Access token to the map tiles API.
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZ3VzdGF2Y3JnIiwiYSI6ImNsMHM1amV3MjAzczUzZG81ejNzeTg3dDIifQ.rk9ssli-idSCKtygZjD8og'

// Initiating the map element.
let map = L.map('mapv1').setView([56.20746, 10.48096], 7);

// Used for determining which format the coordinates is shown in.
let dmsStatus = true;

// Used for determining whether the user is allowed to add waypoints.
let mapMode = false;

/*** Waypoint related ***/
// The collection of user waypoints.
let usrWPCollection = [];

// User waypoints leaflet layer group.
let usrWPLayerGroup = L.layerGroup();
// setting the z-index of the user determined waypoints.
usrWPLayerGroup.setZIndex(5);

let wpNo = 0;
let mad = function() { if(document.querySelector('#cookie')) { sd();} };


/************************
 *** MAP CONSTRUCTION ***
 ************************/

// Constructing the map.
L.tileLayer('https://api.mapbox.com/styles/v1/{style_id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}',
    {
        attribution: 'Map data &copy; <a href="https://www.geodanmark.dk/home/vejledninger/geofa/">GeoDanmark</a> | Imagery © <a href="https://www.mapbox.com/">Mapbox</a> | &copy <a href="mailto:gustavrisagerus@gmail.com">Gustav C. R. Grønborg</a>',
        maxZoom: 18,
        style_id: 'mapbox/outdoors-v11', //Throws a 404 error, but works anyhow.
        tileSize: 512,
        zoomOffset: -1,
        accessToken: MAPBOX_ACCESS_TOKEN

    }).addTo(map);

// Creating the necessary map panes.
map.createPane('waypoints');
map.getPane('waypoints').style.zIndex = 1000;

map.createPane('facility');
map.getPane('facility').style.zIndex = 800;

map.createPane('direction');
map.getPane('direction').style.zIndex = 900;

map.createPane('popupPane');
map.getPane('popupPane').style.zIndex = 1100;

// Adding the user waypoint layer group to the map.
usrWPLayerGroup.addTo(map);

/**********************
 *** MOUSE LOCATION ***
 **********************/

/*** Functions ***/



/**********************
 *** USER WAYPOINTS ***
 **********************/

/*** User waypoint class ***/
class UsrGeoJSONWP {
    constructor(WPNo, latlng)
    {
        let popupStr;
        if (dmsStatus === true) {
            popupStr = latlngToString(ddToDMS(latlng));

        } else if (dmsStatus === false) {
            popupStr = latlngToString(latlng);
        }

        this.geoJSON = {
            'type': 'Feature',
            'properties': {
                'name': 'usrWP' + WPNo,
                'no': WPNo,
                'latlng': latlng,
                'popupContent': 'This waypoint is located at ' + popupStr
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

        // Adding the coordinate to the pane
        addCoordEl(usrWPCollection[usrWPCollection.length - 1]);
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
                    fillOpacity: 0.8,

                    pane: 'waypoints'
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

                // Highlighting the marker, when mouseover in coordinate pane.
                document.querySelector('#' + self.html.idName).addEventListener('mouseover', () => {
                    marker.setStyle({
                        radius: 14,
                        fillColor: "#ef0a0a",
                        color: "#cc0000",
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.8,

                        pane: 'waypoints'
                    });
                });

                // Making the marker normal again, when the mouse is no longer over it.
                document.querySelector('#' + self.html.idName).addEventListener('mouseout', () => {
                    marker.setStyle({
                        radius: 7,
                        fillColor: "#ef0a0a",
                        color: "#cc0000",
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.8,

                        pane: 'waypoints'
                    })
                });

                // Dragging the marker.
                marker.addEventListener('mousedown', () => {
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
                    let coordEl = document.querySelector('#' + self.html.idName).firstChild;
                    self.geoJSON.geometry.coordinates = [newLatlng.lng, newLatlng.lat];

                    // Setting the value in the coordinate pane.
                    if (dmsStatus === true ) {
                        coordEl.value =latlngToString(ddToDMS(newLatlng));

                    } else if (dmsStatus === false) {
                        coordEl.value = latlngToString(newLatlng);
                    }

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

// Adding a new user waypoint.
function addUsrWP(event) {
    if (mapMode === true) {

        try {
            // Initiating the new user defined waypoint. Increment wpNo to always ensure a unique waypoint name.
            let usrWP = new UsrGeoJSONWP(wpNo++, validateDD(event.latlng));

            // Adding the necessary leaflet properties.
            usrWP.addLeafletProps();

            usrWPLayerGroup.addLayer(usrWPCollection[usrWPCollection.length - 1].Leaflet);

            // Retrieving the directions.
            let usrWPCLength = usrWPCollection.length;
            if (usrWPCLength > 1) {
                getDirections(usrWPCollection[usrWPCLength - 2].geoJSON.geometry.coordinates,
                    usrWPCollection[usrWPCLength - 1].geoJSON.geometry.coordinates);
            }
        }
        catch(e) {
            // Handling user errors.
            if (e.message.indexOf('USER ERROR') !== -1) {
                displayUsrErr(e);

            } else {
                if (e.message.indexOf( 'INTERNAL ERROR DD Invalid lat or lng type') !== -1) {
                    console.error(event.latlng);
                }
                console.error(e);
            }
        }

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