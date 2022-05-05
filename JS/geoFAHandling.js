/************************
 *** GLOBAL VARIABLES ***
 ************************/
const fac_pkt_FRO = 'fkg.t_5800_fac_pkt';
const fac_pkt_SEL = 'geometri,off_kode,navn,beskrivels,lang_beskr,ansvar_org,kontak_ved,vandhane_k,betaling_k,book_k,saeson_k,antal_pl,link,saeson_bem,saeson_st,saeson_sl F';

const fac_fl_FRO = 'fkg.t_5801_fac_fl';
const fac_fl_SEL = fac_pkt_SEL;

const fac_li_FRO = 'fkg.t_5802_fac_li';
const fac_li_SEL = 'geometri,statusKode,off_kode,rute_uty_k,navn,navndels,straekn_nr,afm_rute_k,laengde,beskrivels,lang_beskr,ansvar_org,kontak_ved,belaegn_k,svaerhed_k,kategori_k,hierarki_k,folde_link,kvalitet_k';

const popupOptions = {
    maxHeight: 100,
    pane: 'popupPane'
};

let facilityCollection = {};
let facilityLayerGroup = L.layerGroup().addTo(map);

/***************
 *** CLASSES ***
 ***************/


class FacilityCollectionElement {
    constructor (name, iconFileName, GeoFATableArr, GeoFACode) {
        this.name = name;
        this.iconPath = './icons/' + iconFileName;
        this.GeoFA = {
            'table': GeoFATableArr,
            'code': GeoFACode,
            'geoJSON': {}
        };
        this.Leaflet = {
            'icon': L.icon({
                iconUrl: './icons/' + iconFileName,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            }),
            'geoJSON': {}
        };
        this.html = {
            'idName': name + 'Icon',
            'title': name
        };
        this.dataLoaded = false;

        // Adding this to the facility collection object.
        facilityCollection[this.name] = this;
    }

    // NOTE addGeoFAData might be redundant
    // Getting the data from the GeoFA database
    addGeoFAData(dataFeatures) {
        this.GeoFA.geoJSON.features = dataFeatures;
    }

    // Initiating the relevant Leaflet properties.
    initLeafletProp(tableName) {
        let leafletIcon = this.Leaflet.icon;

        if (tableName === fac_pkt_FRO) {
            // Creating the popup text
            this.GeoFA.geoJSON.pkt.features.forEach((element) => {
                popupText(element);
            });

            // Initiating the leaflet layer.
            this.Leaflet.geoJSON.pkt = L.geoJSON(this.GeoFA.geoJSON.pkt, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {
                        icon: leafletIcon,
                        pane: 'facility',
                    });
                },

                // Initiating the popup
                onEachFeature: onEachFeature
            });

        } else if (tableName === fac_fl_FRO) {
            // Creating the popup text
            this.GeoFA.geoJSON.fl.features.forEach((element) => {
                popupText(element);
            });

            this.Leaflet.geoJSON.fl = L.geoJSON(this.GeoFA.geoJSON.fl, {
                style: {
                    weight: 1,
                    color: '#000000',
                    opacity: 1,
                    fillColor: '#156e2d',
                    fillOpacity: 0.3
                },
                onEachFeature: onEachFeature
            });

        } else if (tableName === fac_li_FRO) {
            this.GeoFA.geoJSON.li.features.forEach((element) => {
                popupText(element);
            });

            // TODO fix the style of the lines. It looks rather ugly...
            this.Leaflet.geoJSON.li = L.geoJSON(this.GeoFA.geoJSON.li, {
                style: {
                    color: '#f5a700',
                    weight: 3
                },
                onEachFeature: onEachLineFeature
            });

        } else {
            console.error('ERROR CODE 2: tableName does not match a valid table! \n Value of tableName: ' + tableName + '\n');
        }

    }


}



/*****************
 *** FUNCTIONS ***
 *****************/

// Getting data from GeoFa
async function getGeofaData(sqlSelect, sqlFrom, sqlWhere) {
    let url = `https://geofa.geodanmark.dk/api/v2/sql/fkg?q=SELECT ${sqlSelect} FROM ${sqlFrom} WHERE ${sqlWhere}&format=geojson&geoformat=geojson&srs=4326`;

    try {
        let response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

// Rendering the data from GeoFA
async function renderGeoFAdata(facObj) {
    // Used to determine SELECT, FROM and WHERE.
    let facObjTable = facObj.GeoFA.table;

    // Used for the parameters used in the geoGeofaData-function.
    let data, sqlSelect, sqlFrom, sqlWhere;

    // Initiates all the necessary data.
    function initData(objTable, propName) {

        // Initiating the data as GeoJSON.
        facObj.GeoFA.geoJSON[propName] = {
            'type': 'FeatureCollection',
            'features': data.features
        }

        // Registering that the data has been loaded.
        facObj.dataLoaded = !!(data);

        // TODO remove blur here.
        if (facObj.dataLoaded === true) {
            document.querySelector('#' + facObj.html.idName).style.filter = 'blur(0) grayscale(1)';
        }

        // Initiating the necessary Leaflet data.
        facObj.initLeafletProp(objTable);

    }

    // Iterating through the relevant tables.
    for (let el of facObjTable) {

        // Determining which table it the relevant one.
        if (el === fac_pkt_FRO) {
            // Determining SELECT, FROM and WHERE.
            sqlSelect = fac_pkt_SEL;
            sqlFrom = fac_pkt_FRO;
            sqlWhere = `facil_ty_k='${facObj.GeoFA.code}'`;

            // Fetching the data
            data = await getGeofaData(sqlSelect, sqlFrom, sqlWhere);

            // Initiating the data.
            initData( el, 'pkt');

        } else if (el === fac_fl_FRO) {
            sqlSelect = fac_fl_SEL;
            sqlFrom = fac_fl_FRO;
            sqlWhere = `facil_ty_k='${facObj.GeoFA.code}'`;

            // Fetching the data
            data = await getGeofaData(sqlSelect, sqlFrom, sqlWhere);

            // Initiating the data.
            initData(el, 'fl');

        } else if (el === fac_li_FRO) {
            sqlSelect = fac_li_SEL;
            sqlFrom = fac_li_FRO;
            sqlWhere = `rute_ty_k='${facObj.GeoFA.code}'`;

            // Fetching the data
            data = await getGeofaData(sqlSelect, sqlFrom, sqlWhere);

            // Initiating the data.
            initData(el, 'li');

        } else {
            console.log('\nCurrent obj:');
            console.log(facObj);
            console.error('ERROR CODE 1: element is not valid! \n Value of element: ' + el);
        }

    }

}

// Adding a popup.
function addPopup(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent, popupOptions);
    }
}


// Function that controls the popup.
function onEachFeature(feature, layer) {
    addPopup(feature, layer);
}

// Function that controls popup, AND highlighting for trails.
function onEachLineFeature(feature, layer) {
    let hlStyleOn = {
        color: '#e402f5',
        weight: 6,
        opacity: .7
    };
    let hlStleOff = {
        color: '#f5a700',
        weight: 3,
        opacity: 1
    };

    // Controlling the popup.
    onEachFeature(feature, layer);

    // Highlighting the layer on mouse over.
    layer.on('mouseover', () => {
        layer.setStyle(hlStyleOn);

    });

    layer.on('mouseout', () => {
        layer.setStyle(hlStleOff);
    });

    // Highlighting the feature on double click.
    layer.on('dblclick', highlightDblClickOn);

    // Turning on highlighting by double-clicking.
    function highlightDblClickOn() {
        // Stopping the map from zooming on double click.
        map.doubleClickZoom.disable();

        layer.off('mouseout');

        layer.setStyle(hlStyleOn);

        layer.on('dblclick', highlightDblclickOff);

        // Allowing the user to zoom by double-clicking again.
        setTimeout(() => {
            map.doubleClickZoom.enable();
        }, 50);
    }

    // Turning off highlighting by double-clicking.
    function highlightDblclickOff() {
        // Stopping the map from zooming on double click.
        map.doubleClickZoom.disable();

        layer.setStyle(hlStleOff);

        // Readding the turn off highlight on mouse out.
        layer.on('mouseout', () => {
            layer.setStyle(hlStleOff);
        });

        // Removing the turn off highlight with dbl click.
        layer.off('dblclick');

        layer.on('dblclick', highlightDblClickOn);
    }

}


// Building the popup text TODO enhance this function
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
        } else { /*
            console.log('Hit default case in switch (obj.properties.vandhane_k). Value of vandhane_k: ' + obj.properties.vandhane_k);
            console.log(obj.properties);
            console.log('obj.properties.vandhane_k === 0 : ' + (obj.properties.vandhane_k === 0))

            console.log('\n'); */
        }
    }

    if (obj.properties.saeson_k !== null) {
        switch (obj.properties.saeson_k) {
            case 1:
                str += 'Faciliteten har helårsåbent. ';
                break;
            case 2:
                str += 'Faciliteten har sæsonåbent' + ((obj.properties.saeson_st != null) ? 'fra ' + obj.properties.saeson_st.toString() : '. ')
                    + ((obj.properties.saeson_sl != null) ? ' til ' + obj.properties.saeson_sl.toString() + ' (MM-DD). ' : '. Sæson afslutningen er ikke oplyst');
                break;

            case 7:
                str += 'Sæsonåbningstider er ikke relevant for denne facilitet. ';
                break;
            default:
                //console.log('Hit default on switch (obj.properties.saeson_k), value: ' + obj.properties.saeson_k);
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
                //console.log('Hit default on switch (obj.properties.book_k), value: ' + obj.properties.book_k);
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
        else { /*
            console.log('Hit else in if (obj.properties.betaling_k !== null), value: ' + obj.properties.betaling_k); */
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


// Visually toggles the data
function toggleData(dataLayer, dataObj, filterVal) {

    // Showing the data.
    if (filterVal === 'grayscale(1)' || filterVal === 'blur(0px) grayscale(1)') {
        facilityLayerGroup.addLayer(dataLayer);

    } else if (filterVal === 'grayscale(0)') {
        facilityLayerGroup.removeLayer(dataLayer);

    } else {
        console.log(filterVal);
        console.error('ERROR CODE 4: filterVal does not match any acceptable value! \n Value of filterVal: ' + filterVal + '\n');
    }
}


// Adding an event listener to an icon.
function addIconEventListener(facObj) {
    document.querySelector(facObj.html.id).addEventListener('click', () => {
        if (facObj.dataLoaded === true) {
            let iconEl = document.querySelector(facObj.html.id);
            let filterVal = getComputedStyle(iconEl).getPropertyValue('filter');


            for (let prop in facObj.Leaflet.geoJSON) {
                toggleData(facObj.Leaflet.geoJSON[prop], facObj.Leaflet.geoJSON, filterVal);

                // Unbinding popups, if mapMode is on.
                if (mapMode === true) {
                    let superLayer = facObj.Leaflet.geoJSON[prop]._layers;

                    for (let layer in superLayer) {
                        superLayer[layer].unbindPopup();
                    }
                }
            }

            if (filterVal === 'grayscale(1)' || filterVal === 'blur(0px) grayscale(1)') {
                iconEl.style.filter = 'grayscale(0)';

            } else if (filterVal === 'grayscale(0)') {
                iconEl.style.filter = 'grayscale(1)';

            } else {
                console.error('EROOR CODE 5: filterVal does not match any acceptable value! \n Value of filterVal: ' + filterVal + '\n');
            }
        }
    });
}


// Adding all icon event listeners.
function addAllIEL() {
    for (let prop in facilityCollection) {
        addIconEventListener(facilityCollection[prop]);
    }
}


/********************
 *** CONSTRUCTION ***
 ********************/

// Row 0
new FacilityCollectionElement('baalhytte', 'baalhytteIconSVG.svg', [fac_pkt_FRO], 3091);
new FacilityCollectionElement('baalplads', 'baalpladsIconSVG.svg', [fac_pkt_FRO, fac_fl_FRO], 1022);
new FacilityCollectionElement('friTeltning', 'friTeltningIconSVG.svg', [fac_pkt_FRO, fac_fl_FRO], 3071);
new FacilityCollectionElement('fritFiskeri', 'fritFiskeriIconSVG.svg', [fac_pkt_FRO, fac_fl_FRO], 2171);

// Row 1
new FacilityCollectionElement('hkLund', 'haengekoejelundIconSVG.svg', [fac_pkt_FRO], 3081);
new FacilityCollectionElement('nationalpark', 'nationalparkIconSVG.svg', [fac_pkt_FRO, fac_fl_FRO], 2121);
new FacilityCollectionElement('naturpark', 'naturparkIconSVG.svg', [fac_pkt_FRO, fac_fl_FRO], 2111);
new FacilityCollectionElement('shelter', 'shelterSVG.svg', [fac_pkt_FRO], 3012);

// Row 2
new FacilityCollectionElement('spejderhytte', 'spejderhytteIconSVG.svg', [fac_pkt_FRO], 1082);
new FacilityCollectionElement('teltplads', 'teltPladsIconSVG.svg', [fac_pkt_FRO, fac_fl_FRO], 3031);
new FacilityCollectionElement('toervejrsrum', 'toervejrsrum:madpakkehusIconSVG.svg', [fac_pkt_FRO], 1132);
new FacilityCollectionElement('vandpost', 'vandpostIconSVG.svg', [fac_pkt_FRO], 1222);

// Row 3
new FacilityCollectionElement('toilet', 'wcSVG.svg', [fac_pkt_FRO], 1012);
new FacilityCollectionElement('vandrerute', 'vandreruteIconSVG.svg', [fac_li_FRO], 5);
new FacilityCollectionElement('motionsrute', 'motionsruteIconSVG.svg', [fac_li_FRO], 6);
new FacilityCollectionElement('rekreativSti', 'rekreativStiIconSVG.svg', [fac_li_FRO], 11);


// Fetching all data from the GeoFA database
for (let prop in facilityCollection) {
    renderGeoFAdata(facilityCollection[prop]);
}