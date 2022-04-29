/*****************
 *** VARIABLES ***
 *****************/

// TODO Make everything compatible with camelCase.

/*** CONSTANTS ***/
const mapboxAccessToken = 'pk.eyJ1IjoiZ3VzdGF2Y3JnIiwiYSI6ImNsMHM1amV3MjAzczUzZG81ejNzeTg3dDIifQ.rk9ssli-idSCKtygZjD8og'
let dmsStatus = true;
let mapMode = false;

// Used for popups.
let popup = L.popup();


/*** CUSTOM MARKERS ***/
// TODO check if this can be safely deleted.
let waypointIcon = L.icon({
    iconUrl: './icons/waypointMarker.png',
    iconSize: [16, 16],
});

// Creating the map.
let map = L.map('mapv1').setView([57.0864069, 9.2667862], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{style_id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}',
{
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    style_id: 'mapbox/outdoors-v11', //Throws a 404 error, but works anyhow.
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxAccessToken

}).addTo(map);

// Used for waypoints.
let usrWPLayerGroup = L.layerGroup().addTo(map);
let usrWP = [];


/*****************
 *** FUNCTIONS ***
 *****************/

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


/*************
 *** MENUS ***
 *************/

// Updates all the coordinates in coordPane to match the current coordinate type
function updateCoordType() {
    let el = document.querySelector("#coordPane");

    // FIXME update to comply with new coord type
    //removeAllChildren(el);
    //allWpToHtml();
}


// Adds all wp from usrWP array to coordPane
// TODO remove
function allWpToHtml() {
    /* let el = document.querySelector("#coordPane");
    let newCoordEl;

    for (let i = 0; i < usrWP.length; i++) {
        newCoordEl = document.createElement("div");
        newCoordEl.className = 'coordEl';
        newCoordEl.textContent = latlngToString(usrWP[i][0].latlng);

        el.appendChild(newCoordEl);
    } */
}


/***************
 *** MARKERS ***
 ***************/

// Evaluates two coordinates.
function locMatchArr(mouseLoc, locArrEl, floor) {
    floor = Math.ceil((map.getZoom()/5) - 1);
    // TODO make floor scalable with zoom-level.
    // TODO simplify this, while still making it readable.
    if (mouseLoc.lat.toFixed(floor) === locArrEl.lat.toFixed(floor) && mouseLoc.lng.toFixed(floor) === locArrEl.lng.toFixed(floor)) {
        let mouse = { "lat": mouseLoc.lat.toFixed(floor), "lng": mouseLoc.lng.toFixed(floor) };
        let wp = { "lat": locArrEl.lat.toFixed(floor), "lng": locArrEl.lng.toFixed(floor) };

        return true;
    }
    else {
        return false;
    }
}


// Defining the GeoJSON user determined waypoint class
class GeojsonWP {
    constructor(name, latlng) {
        this.type = "Feature";
        this.properties = {
            "name": name,
            "latlng": latlng,
            "popupContent": latlng.toString()
        };
        this.geometry = {
            "type": "Point",
            "coordinates": [latlng.lng, latlng.lat]
        }
    }

    wpToLayer() {
        // FIXME Sometimes, randomly not adding new elements.
        // Setting visual properties of new GeoJSON marking and initialising it.
        let newUsrWP = {
            "geojson": this,

            "geojsonWP": L.geoJSON(this, { //TODO Understand how this works... Right now the code is from Leaflet tutorial.
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 7,
                        fillColor: "#ef0a0a",
                        color: "#cc0000",
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                }
            }),
            "latlng": this.properties.latlng
        };
        // This is added because objects in JS are passed by reference, arrays are not.
        let locArr = [newUsrWP];

        // Adding new user waypoint to user waypoint array.
        usrWP.push(locArr.slice());

        // Adding waypoint to the coordinates list
        addCoordToList(usrWP.length - 1, usrWP[usrWP.length - 1][0].geojson.geometry.coordinates);

        // Adding waypoint to map.
        usrWPLayerGroup.addLayer(usrWP[usrWP.length - 1][0].geojsonWP);


    }
}


// Adding a user determined waypoint formatted as GeoJSON
function addUsrGeojsonWP(event) {
    let name = "waypoint" + usrWP.length.toString();
    let wp = new GeojsonWP(name, event.latlng);


    // Adding the new GeoJSON point to the map.
    wp.wpToLayer();

    // Getting and drawing directions, when the user has added more than a single waypoint.
    if (usrWP.length > 1) {

        let start = usrWP[usrWP.length - 2][0].geojson.geometry.coordinates;
        let end = usrWP[usrWP.length - 1][0].geojson.geometry.coordinates;

        getDirections(start, end);
    }
}


// Removes user waypoint.
function rmvUsrWP(event) {
    if (mapMode) {

        let i = 0;
        while (i < usrWP.length) {

            if (locMatchArr(event.latlng, usrWP[i][0].latlng, 3)) {
                console.log("Removing waypoint" + i);
                console.log(usrWP);

                // Updating the usrWP arr and layer group
                usrWPLayerGroup.removeLayer(usrWP[i][0].geojsonWP);
                usrWP.splice(i, 1);

                // Removing the directions layers and array
                directionsLayerGroup.clearLayers();
                directionsArr = [];

                // Updating the directions arr and layer group
                if (usrWP.length > 1) {
                    // Adding the new directions
                    for (let i = 1; i < usrWP.length; i++) {
                        let usrWPCoord = idx => { return usrWP[idx][0].geojson.geometry.coordinates; };
                        getDirections(usrWPCoord(i - 1), usrWPCoord(i));
                    }
                }


                // TODO This break is most possibly redundant.
                break;
            }
            else {
                i++;
            }
        }

        // TODO This needs to be updated to work with the new menu pane
        // Updates the coordinates pane.
        updateCoordType();
    }
    //TODO Add tooltip for contextmenu with mapMode false.
}


/***********************
 *** EVENT FUNCTIONS ***
 ***********************/
function onMapClick(event) {


    if (mapMode) {
        addUsrGeojsonWP(event);
        // TODO Look at the below commented and determine whether or not it is to be deleted.
        //wpToHTML();
    }
    /*
    else {
        popup
            .setLatLng(event.latlng)
            .setContent("If you want to plan a route, please toggle map mode in the upper right corner.")
            .openOn(map);

    } */

}

function toggleMapMode() {
    document.querySelector("#mapModeToggle").style.filter = (mapMode) ? "grayscale(100%)" : "grayscale(0)";

    mapMode = !mapMode;

    map.closePopup();
}



/***********************
 *** EVENT LISTENERS ***
 ***********************/

/*** Map event listeners ***/

// TODO Do this in a smarter way...
map.on('click', onMapClick);

// Remove waypoint.
map.on("contextmenu", rmvUsrWP);


// Toggle mapMode.
document.querySelector("#mapMode").addEventListener('click', toggleMapMode);



/*************
 *** OTHER ***
 *************/


// Removes all children of a node
function removeAllChildren(node) {
    let curChild = node.lastElementChild;

    while (curChild) {
        node.removeChild(curChild);
        curChild = node.lastElementChild;
    }
}
