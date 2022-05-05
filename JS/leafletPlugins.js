/***********************
 *** Leaflet Plugins ***
 ***********************/

/*** Additions to the Layer Group Class ***/
L.LayerGroup.include({
    // Unbinding all popups.
    unbindAllPopups: function () {
        for (let superLayer in this._layers) {
            let subLayer = this._layers[superLayer]._layers;

            for (let baseLayer in subLayer) {
                subLayer[baseLayer].unbindPopup();
            }
        }
    },


    // Binding all popups.
    bindAllPopups: function (popupOptions) {
        for (let superLayer in this._layers) {
            let subLayer = this._layers[superLayer]._layers;

            for (let baseLayer in subLayer) {
                let layer = subLayer[baseLayer];
                let feature = layer.feature;

                if (feature.properties && feature.properties.popupContent) {
                    layer.bindPopup(feature.properties.popupContent, popupOptions);
                }
            }
        }
    }
});



/*** Additions to the Layer class ***/
L.Layer.include({
    // Moving a circle marker.
    moveMarker: function (latlng) {
        for (let layer in this._layers) {
            let marker = this._layers[layer];

            marker.setLatLng(latlng);
        }
    },

    // Getting the latlng object.
    getLatLng: function() {
        let latlng;

        for (let layer in this._layers) {
            latlng = this._layers[layer]._latlng;
        }

        return latlng;
    }
});