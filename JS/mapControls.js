(function createMapControls() {
    // Adding the map controls container.
    addChildToParent('body', 'div', 'mapControlsContainer');

    // Adding the mapModeToggle.
    addMapModeToggle();

    // Adding the gpx btn.
    addGpxBtn();

})();


/*********************
 *** mapModeToggle ***
 *********************/
// Adding the mapModeToggle
function addMapModeToggle() {
    // Adding the element to the controls container.
    addChildToParent('#mapControlsContainer', 'img', 'mapModeToggle');

    // Setting the source of the icon.
    let mapModeBtn = document.querySelector('#mapModeToggle');
    mapModeBtn.src = 'icons/mapModeIconSVG.svg';

    mapModeBtn.className = 'mapControlsEl';

    // Adding an event listener to the mapModeToggle.
    mapModeBtn.addEventListener('click', toggleMapMode);
}


// Toggling the map mode
function toggleMapMode() {
    //mad();
    document.querySelector("#mapModeToggle").style.filter = (mapMode) ? "grayscale(100%)" : "grayscale(0)";

    if (mapMode === true) {
        // Binding all popups.
        facilityLayerGroup.bindAllPopups(popupOptions);

        mapMode = false;

    } else {
        // Unbinding all popups.
        facilityLayerGroup.unbindAllPopups();

        mapMode = true;
    }

}



/*********************
 *** EXPORT TO GPX ***
 *********************/
// Adding the export to gpx button.
function addGpxBtn() {
    // Adding the element to the controls container.
    addChildToParent('#mapControlsContainer', 'img', 'gpxBtn');

    // Setting the source of the icon.
    let gpxbtn = document.querySelector('#gpxBtn');
    gpxbtn.src = 'icons/gpxIconSVG.svg';

    gpxbtn.className = 'mapControlsEl';

    // Adding an event listener to the gpx button.
    gpxbtn.addEventListener('click', () => {
        downloadGpxFile(compileDirectionsData());
    });
}
