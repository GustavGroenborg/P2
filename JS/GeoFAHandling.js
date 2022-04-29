// Remember that all global variables do not need to be imported.

/****************************
 *** ICONS AND ICON LAYER ***
 ****************************/

// Creating a new icon
function createNewIcon(iconFileName) {
    return L.icon({
        iconUrl: './icons/' + iconFileName,
        iconSize: [24, 24],
        iconAnchor: [12, 12], // Placing the icon directly on top of the location
        popupAnchor: [0, -12] // Placing the popup directly over the icon.
    });
}

//TODO consider creating the icons as constants
// TODO give the icons some nicer names
// Defining and initiating all the icons
// Icons are names after the first letter of the first two syllables.
// Bålhytte
const bhIcon = createNewIcon('baalhytteIconSVG.svg');

// Bålplads
const bpIcon = createNewIcon('baalpladsIconSVG.svg');

// Fri teltning
const ftIcon = createNewIcon('friTeltningIconSVG.svg');

// Frit fiskeri
const ffIcon = createNewIcon('fritFiskeriIconSVG.svg');

// Hængekøjelund
const hkIcon = createNewIcon('haengekoejelundIconSVG.svg');

// Nationalpark
const ntnParkIcon = createNewIcon('nationalparkIconSVG.svg');

// Naturpark
const ntIcon = createNewIcon('naturparkIconSVG.svg');

// Shelter
const stIcon = createNewIcon('shelterSVG.svg');

// Spejderhytte
const sdIcon = createNewIcon('spejderhytteIconSVG.svg');

// Teltplads
const tpIcon = createNewIcon('teltPladsIconSVG.svg');

// Tørvejrsrum/madpakkehus
const tvIcon = createNewIcon('toervejrsrum:madpakkehusIconSVG.svg');

// Vandpost
const vpIcon = createNewIcon('vandpostIconSVG.svg');

// WC
const waterClosetIcon = createNewIcon('wcSVG.svg');


// Defining and initiating the facilities layer group
let facilLayerGroup = L.layerGroup().addTo(map);

// Defining a facility object that will be used to control the layers
let facilObj = {};


/***********************
 *** Test of concept ***
 ***********************/
// Building the popup text
function popupText(obj) {
    let str = '';

    if (obj.properties.navn !== null) {
        str += obj.properties.navn + '. ';
    }

    if (obj.properties.beskrivels !== null) {
        str += obj.properties.beskrivels + '. ';
    }

    if (obj.properties.lang_beskr !== null) {
        str += obj.properties.lang_beskr + '. ';
    }

    if (obj.properties.ansvar_org !== null && obj.properties.kontak_ved !== null) {
        str += obj.properties.ansvar_org + ' har ansvaret for denne facilitet og kan kontaktes på: ' + obj.properties.kontak_ved + '. ';
    }

    if (obj.properties.vandhane_k !== null) {
        let vandhane_k = obj.properties.vandhane_k;

        // For some god forsaken reason I cannot do this as a switch statement
        if (vandhane_k === 0) {
            str += 'Der er ingen vandhane tilgængelig ved faciliteten. ';
        } else if (vandhane_k === 1) {
            str += 'Der bør være en vandhane tilgængelig ved faciliteten. ';
        } else if (vandhane_k === 2) {
            console.log('Case 2. Value of vandhane_k: ' + obj.properties.vandhane_k);
            console.log(obj.properties);
            console.log('\n');
        } else if (vandhane_k === 3) {
            str += 'Det er ukendt om der er en vandhane tilgængelig ved faciliteten. ';
        } else {
            console.log('Hit default case in switch (obj.properties.vandhane_k). Value of vandhane_k: ' + obj.properties.vandhane_k);
            console.log(obj.properties);
            console.log('obj.properties.vandhane_k === 0 : ' + (obj.properties.vandhane_k === 0))

            console.log('\n');
        }
    }

    if (obj.properties.saeson_k !== null) {
        switch (obj.properties.saeson_k) {
            case 1:
                str += 'Faciliteten har helårsåbent. ';
                break;
            case 2:
                str += 'Faciliteten har sæsonåbent' + ((obj.properties.saeson_st !== null) ? 'fra ' + obj.properties.saeson_st.toString() : '. ')
                    + ((obj.properties.saeson_sl !== null) ? ' til ' + obj.properties.saeson_sl.toString() + ' (MM-DD). ' : '. Sæson afslutningen er ikke oplyst');
                break;

            case 7:
                str += 'Sæsonåbningstider er ikke relevant for denne facilitet. ';
                break;
            default:
                console.log('Hit default on switch (obj.properties.saeson_k), value: ' + obj.properties.saeson_k);
                break;
        }

        if (obj.properties.saeson_bem !== null) {
            str += 'Der er følgende bemærkninger til sæsonåbningstiderne: ' + '\"' + obj.properties.saeson_bem + '.\" ';
        }
    }

    if (obj.properties.book_k !== null) {
        switch(obj.properties.book_k) {
            case 0:
                str += 'Faciliteten skal ikke bookes. ';
                break;
            case 1:
                str += 'Faciliteten skal bookes. ';
                break;
            case 2:
                str += 'Der er mulighed for at booke faciliteten, men det er ikke påkrævet. ';
                break;
            case 3:
                str += 'Det er ukendt om faciliteten skal bookes. ';
                break;
            default:
                console.log('Hit default on switch (obj.properties.book_k), value: ' + obj.properties.book_k);
                break;
        }
    }

    if (obj.properties.betaling_k !== null) {
        if (obj.properties.betaling_k === 0) {
            str += 'Der er ikke påkrævet betaling for faciliteten. ';
        }
        else if (obj.properties.betaling_k === 1) {
            str += 'Der kræves betaling for faciliteten. Information herom bør kunne findes påfølgende link: ' + obj.properties.link + ' ';
        }
        else {
            console.log('Hit else in if (obj.properties.betaling_k !== null), value: ' + obj.properties.betaling_k);
        }
    }

    if (obj.properties.betaling_k === null && (obj.properties.link == "" || obj.properties.link === null)) {
        str += 'Der bør kunne findes flere informationer om faciliteten på følgende link: ' + obj.properties.link;
    }

    //TODO remove this at some point
    str += '\n The location of this facility is: ' + obj.geometry.coordinates;

    // Setting the contents of the popup content.
    obj.properties.popupContent = str;
}


// Function that controls the popup.
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent, {
            maxHeight: 100});
    }
}


// Making a facility class
class Facility {
    constructor(data) {
        this.type = 'FeatureCollection';
        this.features = data.features;
    }

    addPointToLayer(facilName, leafletIconVar) {
        this.features.forEach((element) => {
            popupText(element);
        });

        let layer = L.geoJSON(this, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: leafletIconVar});
            },
            onEachFeature: onEachFeature
        });

        // Adding the layer to the facility object.
        facilObj[facilName] = layer;
    }

    addPolygonToLayer(facilName, leafletIconVar) {
        // TODO Create a popup text function for polygons here
        this.features.forEach((element) => {
            popupText(element);
        });

        facilObj[facilName] = L.geoJSON(this, {
            style: {
                weight: 1.5,
                color: '#000000',
                opacity: 1,
                fillColor: '#156e2d',
                fillOpacity: 0.7
            },
            onEachFeature: onEachFeature
        });

    }

    addLineToLayer(facilName) {
        // TODO create a popup text function for lines here
    }
}

// Getting data from GeoFa
// TODO rewrite this to comply with polygon layers too.
async function getGeofaData(facGroup, facilTyK) {
    let url = `https://geofa.geodanmark.dk/api/v2/sql/fkg?q=SELECT geometri,off_kode,navn,beskrivels,lang_beskr,ansvar_org,kontak_ved,vandhane_k,betaling_k,book_k,saeson_k,antal_pl,link,saeson_bem,saeson_st,saeson_sl FROM ${facGroup} WHERE facil_ty_k='${facilTyK}'&format=geojson&geoformat=geojson&srs=4326`;

    try {
        let response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

// Rendering the data from GeoFA
async function renderGeofaData(facilName, facGroup, facilTyK, LeafletIconVar) {
    let data = await getGeofaData(facGroup, facilTyK);
    let facil = new Facility(data);

    if (facGroup === 'fkg.t_5800_fac_pkt') {
        facil.addPointToLayer(facilName, LeafletIconVar);
    }
    else if (facGroup === 'fkg.t_5801_fac_fl') {
        facil.addPolygonToLayer(facilName, LeafletIconVar);
    }
    else {
        console.log('ERROR: unacceptable facGroup! \n value of facGroup: ' + facGroup + '\n');
    }

}



/****************************************************
 *** Getting all the data from the GeoFA database ***
 ****************************************************/

/*** Points ***/
renderGeofaData('baalhytte', 'fkg.t_5800_fac_pkt', 3091, bhIcon);
renderGeofaData('baalplads', 'fkg.t_5800_fac_pkt', 1022, bpIcon); // This seems to work at random. Sometimes returning, "t is undefined."
renderGeofaData('friTeltning', 'fkg.t_5800_fac_pkt', 3071, ftIcon);
renderGeofaData('fritFiskeri', 'fkg.t_5800_fac_pkt', 2171, ffIcon);

renderGeofaData('hkLund', 'fkg.t_5800_fac_pkt', 3081, hkIcon);
renderGeofaData('nationalpark', 'fkg.t_5800_fac_pkt', 2121, ntnParkIcon);
renderGeofaData('naturpark', 'fkg.t_5800_fac_pkt', 2111, ntIcon);
renderGeofaData('shelter', 'fkg.t_5800_fac_pkt', 3012, stIcon);

renderGeofaData('spejderhytte', 'fkg.t_5800_fac_pkt', 1082, sdIcon);
renderGeofaData('teltplads', 'fkg.t_5800_fac_pkt', 3031, tpIcon);
renderGeofaData('toervejrsrum', 'fkg.t_5800_fac_pkt', 1132, tvIcon);
renderGeofaData('vandpost', 'fkg.t_5800_fac_pkt', 1222, vpIcon);

renderGeofaData('wc', 'fkg.t_5800_fac_pkt', 1012, waterClosetIcon);


/*** Polygons ***/
renderGeofaData('friTeltning_fl', 'fkg.t_5801_fac_fl', 3071, ftIcon);



/*************************************
 *** Handling the icons as buttons ***
 *************************************/

// Displaying the relevant data and greyscaling the icon if needed
function toggleData(iconID, iconLayerName, iconFlLayerName) {
    let iconEl = document.querySelector(iconID);

    console.log(getComputedStyle(iconEl).getPropertyValue('filter'));

    if (getComputedStyle(iconEl).getPropertyValue('filter') === 'grayscale(1)') {
        iconEl.style.filter = 'grayscale(0)';
        facilLayerGroup.addLayer(facilObj[iconLayerName]);

        // Making it so that polygons also will be added
        if (iconFlLayerName) {
            facilLayerGroup.addLayer(facilObj[iconFlLayerName]);
        }
        console.log('A layer has been added.');

    } else if (getComputedStyle(iconEl).getPropertyValue('filter') === 'grayscale(0)') {
        iconEl.style.filter = 'grayscale(1)';
        facilLayerGroup.removeLayer(facilObj[iconLayerName]);

        // Making it so that polygons also will be removed.
        if (iconFlLayerName) {
            facilLayerGroup.removeLayer(facilObj[iconFlLayerName]);
        }
        console.log('A layer has been removed.');
    }
    else {
        console.log('Dangling else in toggleData()');
    }
}


// Helper function for adding an event listener
function iconEventListener(iconID, iconLayerName, iconFlLayerName) {
    document.querySelector(iconID).addEventListener('click', () => {
        if (iconFlLayerName) {
            toggleData(iconID, iconLayerName, iconFlLayerName);
        } else {
            toggleData(iconID, iconLayerName);
        }
    });
}



/***********************
 *** Event listeners ***
 ***********************/

/*** ROW 1 ***/
// Bålhytte icon
iconEventListener('#baalhytteIcon', 'baalhytte');

// Bugs out seemingly at random "TypeError: t is undefined" Minor tests on this has been concluded.
// The reason for the bug might be due to the assets not yet being loaded, when activating.
// Bålplads Icon
iconEventListener('#baalpladsIcon', 'baalplads');

// TODO remember to add the other, "fri teltning," areas, as this one does only inlcude one.
// Fri teltning
iconEventListener('#friTeltningIcon', 'friTeltning', 'friTeltning_fl');

// Frit fiskeri
iconEventListener('#fritFiskeriIcon', 'fritFiskeri');

/*** ROW 2 ***/
// Hængekøjelund
iconEventListener('#hkLundIcon', 'hkLund');

// Nationalpark
iconEventListener('#nationalparkIcon', 'nationalpark');

// Naturpark
iconEventListener('#naturparkIcon', 'naturpark'); // TODO Consider removing this as it is empty

// Shelter
iconEventListener('#shelterIcon', 'shelter');

/*** ROW 3***/
// Spejderhytte
iconEventListener('#spejderhytteIcon', 'spejderhytte');

// Teltplads
iconEventListener('#teltpladsIcon', 'teltplads')

// Tørvejrsrum/madpakkehus
iconEventListener('#tmIcon','toervejrsrum');

// Vandpost
iconEventListener('#vandpostIcon', 'vandpost');

/*** ROW 4***/
// WC
iconEventListener('#wcIcon', 'wc');