/******************************
 *** COORDINATE CONVERSIONS ***
 ******************************/

/*** Constants ***/

const COORD_DECIMALS = 3;



/*** Functions ***/

/**
 * Converts a string containing DD latitude and DD longitude to a latlng object.
 * This function DOES NOT validate the input.
 * @param str: Input string containing DD latitude and DD longitude.
 * @returns {{lng: *, lat: *}}: A DD latlng object.
 */
function ddStringToLatLng(str) {
    let input = str.split(',');
    return {'lat': input[0], 'lng': input[1]};
}


/**
 * Converts a DMS string to a DD latlng object.
 * This function does not validate the input.
 * @param latlngStr: String containing latitude and longitude.
 * @returns {latlng}: Object containg latitude and longitude.
 */
function dmsStringToDDLatlng(latlngStr) {
    let latIdx = latlngStr.indexOf('N') + 1;
    let lat = latlngStr.slice(0, latIdx);
    let lng = latlngStr.slice(latIdx);

    let latArr = lat.split(/[\xB0'"d]+/);
    let lngArr = lng.split(/[\xB0'"]+/);

    let latlngDMS = {'lat': {}, 'lng': {}};
    let latlng = {};

    // Determining the DD latitude.
    latlngDMS.lat.d = Number.parseInt(latArr[0]);
    latlngDMS.lat.m = Number.parseInt(latArr[1]) / 60;
    latlngDMS.lat.s = (Number.parseFloat(latArr[2]) / 3600);

    // Determining the DD longitude.
    latlngDMS.lng.d = Number.parseInt(lngArr[0]);
    latlngDMS.lng.m = Number.parseInt(lngArr[1]) / 60;
    latlngDMS.lng.s = (Number.parseFloat(lngArr[2]) / 3600);// Determining the longitude.

    // Calculating DD latitude.
    latlng.lat = latlngDMS.lat.d + latlngDMS.lat.m + latlngDMS.lat.s;
    // Calculating DD longitude.
    latlng.lng = latlngDMS.lng.d + latlngDMS.lng.m + latlngDMS.lng.s;

    return latlng;
}


/**
 * Converts a latlng obj to a string.
 * @param latlng: A latlng object.
 * @returns {string}: A string containing the latitude and longitude either in DMS or DD.
 */
function latlngToString(latlng) {
    let lat = latlng.lat;
    let lng = latlng.lng;
    let latlngStr, latStr, lngStr;

    if (dmsStatus) {
        latStr = lat.d.toString() + "\xB0" + " " + lat.m.toString() + "' " + lat.s.toFixed(COORD_DECIMALS).toString() + "\"" + (lat.d > 0 ? "N" : "S");
        lngStr = lng.d.toString() + "\xB0" + " " + lng.m.toString() + "' " + lng.s.toFixed(COORD_DECIMALS).toString() + "\"" + (lng.d > 0 ? "E" : "W");

        latlngStr = latStr + '\u00A0 \u00A0' + lngStr;

        return latlngStr;
    } else {
        latStr = latlng.lat.toFixed(COORD_DECIMALS).toString(); // 5 decimals will yield a coordinate precision of 1.11m.
        lngStr = latlng.lng.toFixed(COORD_DECIMALS).toString();
        latlngStr = latStr + ', ' + lngStr;

        return latlngStr;
    }
}


/**
 * Converts a DD object to a DMS object.
 * @param latlngObj: DD latlng object.
 * @returns {{lng: {}, lat: {}}} DMS latlng object.
 * @constructor
 */
function ddToDMS(latlngObj) {
    let lat = latlngObj.lat;
    let lng = latlngObj.lng;
    let dms = {lat: {}, lng: {}};

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