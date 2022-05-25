/*****************************
 *** COORDINATE VALIDATION ***
 *****************************/

/*** Constants ***/
const LAT_MAX = 58;
const LAT_MIN = 54;

const LNG_MAX = 16;
const LNG_MIN = 7;

const MAX_MIN = 60;
const MAX_SEC = 60;

const DEG_SIGN = '\xB0'

/*** Functions ***/

/**
 * Checking that the necessary DMS properties exist.
 * @param dmsObj: DMS Object.
 * @returns {boolean}: True if properties exist, otherwise false.
 */
function DMSObjHasAllProperties(dmsObj) {
    if ((dmsObj.lat.hasOwnProperty('d') && dmsObj.lat.hasOwnProperty('m') && dmsObj.lat.hasOwnProperty('s')) &&
        (dmsObj.lng.hasOwnProperty('d') && dmsObj.lng.hasOwnProperty('m') && dmsObj.lng.hasOwnProperty('s'))) {
        return true;

    } else {
        return false;
    }
}


/**
 * Checking that DMS properties are of a specified type.
 * @param dmsObj: DMS object.
 * @param typeStr: Which type, as a string.
 * @returns {boolean}: True if properties are of type typeStr, otherwise false.
 */
function DMSObjPropsTypeof(dmsObj, typeStr) {
    if ((typeof dmsObj.lat.d === typeStr && typeof dmsObj.lat.m === typeStr && typeof dmsObj.lat.s === typeStr) &&
        (typeof dmsObj.lng.d === typeStr && typeof dmsObj.lng.m === typeStr && typeof dmsObj.lng.s === typeStr)) {
        return true;

    } else {
        return false;
    }
}


/**
 * Parses the string values of a DMS object's properties.
 * @param inputObj: Input DMS object.
 * @param outputObj: Where to output the parsed property values.
 * @param propName: Either lat, lng or leave out.
 * @param recursion: Used if call is recursive. True || False.
 */
function parseDMSSubProps(inputObj, outputObj, propName, recursion = undefined) {
    // Determining whether a propName is specified or not.
    if (propName) {
        // Determining whether if the property values are a valid type.
        if (inputObj.d.indexOf('.') === -1 || inputObj.m.indexOf('.') === -1) {
            // Determining if the seconds property is an integer of float.

            // Seconds is a float.
            if (inputObj.s.indexOf('.') !== -1 && inputObj.s.indexOf('.') === inputObj.s.lastIndexOf('.')) {
                // Parsing the property values.
                outputObj[propName].d = Number.parseInt(inputObj.d);
                outputObj[propName].m = Number.parseInt(inputObj.m);
                outputObj[propName].s = Number.parseFloat(inputObj.s);

            } else if (inputObj.s.indexOf('.') === -1) { // Seconds is an integer.
                outputObj[propName].d = Number.parseInt(inputObj.d);
                outputObj[propName].m = Number.parseInt(inputObj.m);
                outputObj[propName].s = Number.parseInt(inputObj.s);
            }
        } else {
            throw new Error('Invalid DMS properties');
        }
    } else {
        // Checking the given object has all the necessary properties.
        if (DMSObjHasAllProperties(inputObj)) {
            if (recursion === undefined) {
                // Parsing the DMS object recursively.
                parseDMSSubProps(inputObj.lat, outputObj, 'lat', true);
                parseDMSSubProps(inputObj.lng, outputObj, 'lng', true);
            } else {
                throw new Error('RECURSION ERROR');
            }
        }
    }
}


/**
 * Validating an input in Degrees-Minutes-Seconds.
 * @param input: DMS input.
 * @param recursion: Used to if call is recursive. True || False.
 * @returns {string|{lng: {}, lat: {}}|*}: Validated string or latlng object.
 */
function validateDMS(input, recursion = undefined) {
    if (typeof input === 'string') {
        let safeString = '';
        let safeArr = [];
        let DMSLatLngObj = { 'lat': {}, 'lng': {} };
        let latStrObj = {};
        let lngStrObj = {};
        let degIdx, minIdx, secIdx, NHSphereIdx, EHSphereIdx;

        // Testing if the string is empty.
        if (input === '') {
            throw new Error('USER ERROR DMS No coordinate has been inputted');
        }

        // Discarding unwanted characters.
        for (let i = 0; i < input.length; i++) {
            switch (input[i]) {
                case 'N':
                    safeString += input[i];
                    break;
                case 'E':
                    safeString += input[i];
                    break;
                case DEG_SIGN:
                case 'd':
                    safeString += input[i];
                    break;
                case '\'':
                    safeString += input[i];
                    break;
                case '"':
                case '.':
                    safeString += input[i];
                    break;
                case '\u00A0':
                    break;

                default:
                    if (!Number.isNaN(Number.parseInt(input[i]))) {
                        safeString += Number.parseInt(input[i]);

                    } else if (input[i] === 'S' || input[i] === 'W') {
                        throw new RangeError('USER ERROR Invalid Hemisphere');
                    }
            }

        }

        // Checking if there is a valid Hemisphere input.
        let NHIdx = safeString.indexOf('N');
        let EHIdx = safeString.indexOf('E');

        if (NHIdx === -1 || EHIdx === -1) {
            // Trying to validate a DD coordinate if a comma is present.
            if (NHIdx === -1 && EHIdx === -1 && input.indexOf(',') !== -1) {
                return latlngToString(
                    ddToDMS(
                        ddStringToLatLng(
                            validateDD(input))));

            } else {
                throw new Error(`USER ERROR DMS Notation for` + ` ` +
                    `${(NHIdx === -1) ? 'Northern (N)' : 'Eastern (E)'}` + ` ` +
                    `Hemisphere not found.`);
            }

          // Checking if there is too many Hemisphere notations.
        } else if (NHIdx !== safeString.lastIndexOf('N') ||
                   EHIdx !== safeString.lastIndexOf('E')) {
            throw new Error(`USER ERROR DMS Too many Hemisphere notations`);

        } else {
            // Checking if the latitude is before the longitude.
            if (!(safeString.indexOf('N') < safeString.indexOf('E'))) throw new Error('USER ERROR Invalid input');
            else {
                // Splitting the safeString into latitude and longitude in the safeArr.
                safeArr = safeString.split('N');

                // Checking and parsing the property values.
                for (let i = 0; i < safeArr.length; i++) {
                    let curObj = (i === 0) ? latStrObj : lngStrObj;
                    let cur = (curObj === latStrObj) ? 'lat' : 'lng';

                    degIdx = safeArr[i].indexOf(DEG_SIGN);
                    minIdx = safeArr[i].indexOf('\'');
                    secIdx = safeArr[i].indexOf('"');

                    // Checking if a 'd' is present if no Degrees sign was found.
                    if (degIdx === -1 && safeArr[i].indexOf('d') !== -1) {
                        degIdx = safeArr[i].indexOf('d');
                    }

                    // Checking that degrees, minutes or seconds notation are present.
                    if (degIdx === -1 || minIdx === -1 || secIdx === -1) {
                        throw new Error(`USER ERROR DMS No notation ${(cur === 'lat') ? 'latitude' : 'longitude'}` + ` ` +
                            `${(degIdx === -1) ? 'degrees (\xB0 or d)' : (minIdx === -1) ? 'minutes (\')' : 'seconds (")'} given`);
                    }

                    curObj.d = safeArr[i].slice(0, degIdx);
                    curObj.m = safeArr[i].slice(degIdx + 1, minIdx);
                    curObj.s = safeArr[i].slice(minIdx + 1, secIdx);

                    // Checking that a number is inputted along with
                    // degrees, minutes or seconds.
                    if (curObj.d === '' || curObj.m === '' || curObj.s === '') {
                        throw new Error(`USER ERROR DMS No number inputted for` + ` ` +
                            `${(cur === 'lat') ? 'latitude' : 'longitude'}` + ` ` +
                            `${(curObj.d === '') ? 'degrees (\xB0)' : (curObj.m === '') ? 'minutes (\')' : 'seconds (")'}`);
                    }

                    // Parsing the property values.
                    parseDMSSubProps(curObj, DMSLatLngObj, cur);

                }

                // Checking that the DMS object has the necessary properties and type.
                if (DMSObjHasAllProperties(DMSLatLngObj) && DMSObjPropsTypeof(DMSLatLngObj,'number')) {
                    if (recursion === undefined) {
                        // Validating the DMS object recursively.
                        if (DMSLatLngObj === validateDMS(DMSLatLngObj, true)) {
                            return safeString;
                        }
                    } else {
                        throw new Error('RECURSION ERROR');
                    }

                } else {
                    throw new Error('INTERNAL ERROR Invalid DMS object');
                }
            }

        }
        return safeString;


    } else if (typeof input === 'object') {
        // Checking if the latitude and longitude properties exist.
        if (!DMSObjHasAllProperties(input)) {
            throw new Error('INTERNAL ERROR Invalid DMS object');

        } else {
            let min, max;

            // Function to check that DMS properties are within the desired range.
            function checkDMSRange(dmsObj) {
                for (let el in dmsObj) {
                    min = (el === 'lat') ? LAT_MIN : LNG_MIN;
                    max = (el === 'lat') ? LAT_MAX : LNG_MAX;

                    // Validating that the degrees is within the desired range.
                    if (!(dmsObj[el].d >= min && dmsObj[el].d <= max)) throw new RangeError('USER ERROR DMS Degrees out of range');

                    // Validating that the minutes is within the valid range.
                    if (!(dmsObj[el].m >= 0 && dmsObj[el].m <= MAX_MIN)) throw new RangeError('USER ERROR DMS Minutes out of range');

                    // Validating that the seconds is within the valid range.
                    if (!(dmsObj[el].s >= 0 && dmsObj[el].s <= MAX_SEC)) throw new RangeError('USER ERROR DMS Seconds out of range');
                }
            }


            // Handling the properties if they are a number.
            if (DMSObjPropsTypeof(input, 'number')) {
                // Checking that the properties are within the desired range.
                checkDMSRange(input);

            } else if (DMSObjPropsTypeof(input, 'string')) {
                let DMSNumObj = { 'lat': {}, 'lng': {} };
                let safeDMSObj = { 'lat': {}, 'lng': {} };

                // Parsing the property values
                parseDMSSubProps(input, DMSNumObj);

                // Validating the DMS object recursively.
                if (recursion === undefined ) validateDMS(DMSNumObj, true);
                else throw new Error ('RECURSION ERROR');

                // Converting property values from a number back to a string.
                for (let prop in DMSNumObj) {
                    for (let subProp in DMSNumObj[prop]) {
                        safeDMSObj[prop][subProp] = DMSNumObj[prop][subProp].toString();
                    }
                }

                return safeDMSObj;

            }

        }

        return input;

    } else {
        throw new TypeError('INTERNAL ERROR Invalid DMS type');
    }
}


/**
 * Validating Decimal-Degrees input.
 * @param input: A string or an object.
 * @param recursion: Used if call is recursive. True || False.
 * @returns {string|{}|{lng}|{lat}|*}: A string or an object.
 */
function validateDD(input, recursion = undefined) {
    let min, max, curNum, decimalIdx;

    // Input is a string.
    if (typeof input === 'string') {
        let safeString = '';

        // Testing if the string is empty.
        if (input === '') {
            throw new Error('USER ERROR DD No coordinate has been inputted');
        }

        // Testing if it has the notations of a DMS coordinate.
        if (input.indexOf('\xB0') !== -1 && input.indexOf('\'') !== -1 &&
            input.indexOf('"') !== -1) {
            return latlngToString(
                dmsStringToDDLatlng(
                    validateDMS(input)));
        }

        // Discarding invalid characters.
        for (let i = 0; i < input.length; i++) {
            if (Number.isNaN(Number.parseInt(input[i])) === false) {
                safeString += Number.parseInt(input[i]);

            } else if (input[i] === ',' || input[i] === '.') {
                safeString += input[i];

            }
        }

        // Checking if anything made it through to safeString.
        if (safeString === '') {
            throw new Error('INTERNAL ERROR safeString empty');
        }

        // Validating the coordinate.
        let separatorIdx = safeString.indexOf(',');
        let latLngArr;

        // Determining if a separator is present.
        if (separatorIdx === -1) {
            throw new Error ('INTERNAL ERROR DD No separator present.');

          // Determining if more than a single separator is present.
        } else if (separatorIdx !== safeString.lastIndexOf(',')) {
            throw new Error('USER ERROR DD Too many separators');

          // Determining if the input is within the range.
        } else {
            latLngArr = safeString.split(',');

            for (let i = 0; i < latLngArr.length; i++) {
                decimalIdx = latLngArr[i].indexOf('.');

                // Determining if the input is a float of an integer.
                if (decimalIdx !== -1) {
                    // Parsing a float.
                    if (decimalIdx === latLngArr[i].lastIndexOf('.')) {
                        // Determining if the input is within the range.
                        let curNum = Number.parseFloat(latLngArr[i]);
                        min = (i === 0) ? LAT_MIN : LNG_MIN;
                        max = (i === 0) ? LAT_MAX : LNG_MAX;

                        // If the number is not within the range.
                        if (!(curNum >= min && curNum <= max)) {
                            // Can also occur if the user has switched lat and lng.
                            throw new RangeError('USER ERROR DD Float out of range');
                        }

                    } else {
                        throw new Error('USER ERROR DD Too many decimal separators');
                    }

                } else {
                    // Parsing integer.
                    for (let i = 0; i < latLngArr.length; i++) {
                        min = (i === 0) ? LAT_MIN : LNG_MIN;
                        max = (i === 0) ? LAT_MAX : LNG_MAX;
                        curNum = Number.parseInt(latLngArr[i]);

                        if (!(curNum >= min && curNum <= max)) {
                            throw new RangeError('USER ERROR DD Int out of range');
                        }
                    }
                }

            }
        }

        return safeString;

    // Input is a latlng object.
    } else if (typeof input === 'object') {
        let safeObj = {};

        // Checking that the lat and lng properties exist.
        if (!(input.hasOwnProperty('lat') && input.hasOwnProperty('lng'))) {
            throw new Error('INTERNAL ERROR DD Invalid latLng object');

        } else {
            // Determining if both lat and lng is valid types.
            if ((typeof input.lat !== 'number' && typeof input.lat !== 'string') &&
                (typeof input.lng !== 'number' && typeof input.lng !== 'string')) {

                throw new TypeError ('INTERNAL ERROR DD Invalid lat or lng type. \n' +
                    'lat type: ' + typeof input.lat + '\n' +
                    'lng type: ' + typeof input.lng);

            } else {
                // Determining if both the latitude and longitude is a string.
                if (typeof input.lat === 'string' && typeof input.lat === 'string') {
                    if (recursion === undefined) {
                        // Recursively validating the input.
                        let validatedCoordArr = validateDD(input.lat + ',' + input.lng, true).split(',');

                        safeObj.lat = validatedCoordArr[0];
                        safeObj.lng = validatedCoordArr[1];

                        return safeObj;

                    } else {
                        throw new Error('RECURSION ERROR');
                    }

                } else if (typeof input.lat === 'number' && typeof input.lng === 'number') {
                    // Determining if the latitude and longitude is within the range.
                    if (!(input.lat > LAT_MIN && input.lat < LAT_MAX)) {
                        throw new RangeError('USER ERROR DD lat out of range');

                    } else if (!(input.lng > LNG_MIN && input.lng < LNG_MAX)) {
                        throw new RangeError('USER ERROR DD lng out of range');
                    }

                    return input;

                } else {
                    throw new Error('INTERNAL ERROR Inconsistent property types');
                }
            }
        }

    } else {
        throw new TypeError('INTERNAL ERROR Invalid DD type');
    }
}


/**
 * Validates a coordinate input.
 * @param inputValue: Latlng object or string containing
 * latitude and longitude.
 * @returns {string|{lng: {}, lat: {}}|*|{}|{lng}|{lat}}: String or object, same as input type.
 */
function validateCoord(inputValue) {
        if (dmsStatus === true) {
            return validateDMS(inputValue);

        } else {
            return validateDD(inputValue);
        }
}


/**
 * Displays an error message to the user.
 * @param errorObj: Error object.
 * @param overrideErrMsg: String containing an error message. Used when a custom error message is desired.
 */
function displayUsrErr(errorObj, overrideErrMsg = undefined) {
    let errMsg = '';
    let divHeight;

    if (overrideErrMsg === undefined) {
        // Reformulating the error message.
        if (errorObj.message.indexOf('DMS') !== -1) {
            errMsg = 'ERROR with Degrees-Minutes-Seconds:' + ' ' + errorObj.message.split('USER ERROR DMS ')[1] + '.';

        } else if (errorObj.message.indexOf('DD') !== -1) {
            errMsg = 'ERROR with Decimal-Degrees:' + ' ' + errorObj.message.split('USER ERROR DD ')[1] + '.';

        } else {
            errMsg = errorObj.message.split('USER ERROR ')[1] + '.';
        }

        // Determining if it is a range error.
        if (errorObj instanceof RangeError) {
            errMsg += ' ' + 'The latitude must be between 54' + '\xB0' + 'N and 58' + '\xB0' + 'N.' +
                ' ' + 'The longitude must be be between 7' + '\xB0' + 'E and 16' + '\xB0' + 'E.';
        }

    } else if (overrideErrMsg) {
        errMsg = overrideErrMsg;
    }

    // Creating a new error div element.
    let errorDiv = document.createElement('div');
    errorDiv.className = 'usrErr';
    errorDiv.textContent = errMsg;

    // Determining where on the page the div should be placed.
    divHeight = (17 * window.innerHeight) / 100 + 3; // 5vh, 3px. From class definition.
    errorDiv.style.top = (divHeight * document.querySelectorAll('.usrErr').length).toString() + 'px';

    document.querySelector('body').appendChild(errorDiv);

    // Deleting the error div after 10 seconds.
    setTimeout(() => {
        errorDiv.remove();}, 10000);

}
