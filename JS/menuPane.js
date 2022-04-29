// Hiding the Leaflet zoom controls
document.querySelector('.leaflet-control-zoom').style.display = 'none';

// Dropdown icon
function dropDownIcon() {
    return `<!-- Created with Vectornator (http://vectornator.io/) -->
        <svg class="dropDownIcon" height="100%" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" version="1.1" viewBox="0 0 48 48" width="100%" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:vectornator="http://vectornator.io" xmlns:xlink="http://www.w3.org/1999/xlink">
        <metadata>
        <vectornator:setting key="IsTimeLapseWatermarkDisabled" value="false"/>
        <vectornator:setting key="UndoHistoryDisabled" value="true"/>
        <vectornator:setting key="VNDimensionsVisible" value="true"/>
        <vectornator:setting key="VNSnapToGuides" value="true"/>
        <vectornator:setting key="WDCMYKEnabledKey" value="false"/>
        <vectornator:setting key="WDDisplayWhiteBackground" value="false"/>
        <vectornator:setting key="WDDynamicGuides" value="false"/>
        <vectornator:setting key="WDGuidesVisible" value="true"/>
        <vectornator:setting key="WDIsolateActiveLayer" value="false"/>
        <vectornator:setting key="WDOutlineMode" value="false"/>
        <vectornator:setting key="WDRulersVisible" value="true"/>
        <vectornator:setting key="WDSnapToEdges" value="false"/>
        <vectornator:setting key="WDSnapToGrid" value="false"/>
        <vectornator:setting key="WDSnapToPoints" value="false"/>
        <vectornator:setting key="WDUnits" value="Pixels"/>
        </metadata>
    <defs/>
    <g id="Layer-1" vectornator:layerName="Layer 1">
        <path d="M24 34L19 29L14 24L9 19L4 14C4 14 9 14 14 14C19 14 19 14 24 14C29 14 29 14 34 14C39 14 44 14 44 14L39 19L34 24L29 29L24 34Z" fill="none" fill-rule="evenodd" opacity="1" stroke="#609744" stroke-dasharray="32.0" stroke-linecap="round" stroke-linejoin="round" stroke-width="7"/>
    </g>
</svg>`;
}



/**********************************
 *** ELEMENT CREATION FUNCTIONS ***
 **********************************/

// Adds a child to a parent
function addChildToParent(parentId, childEl, childId, childClass) {
    let parent = document.querySelector(parentId);
    let newChild = document.createElement(childEl);


    newChild.id = childId;

    if (childClass) {
        newChild.className = childClass;
        console.log('Adding class' + childClass + ' to child');
    }

    parent.appendChild(newChild);
}


// Adds a headline to a menu pane
function addMenuPaneHeadLine(parentId, childId, childTextContent) {
    let parent = document.querySelector(parentId);
    let newHeadline = document.createElement('div');

    newHeadline.id = childId;
    newHeadline.className = 'menuPaneHeadline';
    newHeadline.classList.add('menuPaneHeaderChild');
    newHeadline.textContent = childTextContent;

    parent.appendChild(newHeadline);
}


// Adds an icon to a menu header
function addIconToMenuHeader(parentId, childId, childClass, childInnerHTML) {
    let parent = document.querySelector(parentId);
    let newIcon = document.createElement('div');

    newIcon.id = childId;
    newIcon.className = childClass;
    newIcon.classList.add('menuPaneHeaderChild');
    newIcon.innerHTML = childInnerHTML;

    parent.appendChild(newIcon);
}


// Drops down a menu
function menuDropDown(menuId, dropDownId) {
    let menuEl = document.querySelector(menuId);
    let dropDownBtn = document.querySelector(dropDownId);

    if (getComputedStyle(menuEl).getPropertyValue('display') === 'inline-block') {
        // Hiding the menu
        dropDownBtn.style.transform = 'rotate(0deg)';
        menuEl.style.display = 'none';
        menuEl.parentElement.style.height = 'auto';
    }
    else {
        // Showing the menu
        dropDownBtn.style.transform = 'rotate(-180deg)';
        menuEl.style.display = 'inline-block';
        menuEl.parentElement.style.height = '40vh';
    }
}



/************************
 *** COORDINATES PANE ***
 ************************/

// Adding elements to the coordinates list
function addCoordToList(coordNum, coordArrEl) {
    console.log('Add coord to list');
    console.log(usrWP);
    let coordList = document.querySelector("#coordList");
    let newCoord = document.createElement('li');
    let coord = document.createElement('input');
    let submit = document.createElement('input');

    // Setting style for the items
    newCoord.className = 'coordItem';

    // Adding values to the new coordinate element in the coordinates list.
    coord.className = 'coordsStyle';
    coord.type = 'text';
    coord.name = 'coord' + coordNum.toString();
    coord.value = coordArrEl.toString();

    // Making the submit button hidden.
    submit.type = 'submit';
    submit.hidden = true;

    newCoord.appendChild(coord);
    newCoord.appendChild(submit);

    coordList.appendChild(newCoord);
}

// Adding all the coordinates to the list.
function addAllCoords() {
    for (let i = 0; i < usrWP.length; i++) {
        addCoordToList(i);
    }
}


// Adding the coordinates pane
addChildToParent('#menuPane', 'div', 'coordPane', 'menuPaneStyle');

// Adding the coordinates pane header
addChildToParent('#coordPane', 'div', 'coordPaneHeader', 'menuPaneHeader');

// Adding the coordinates pane header headline
addMenuPaneHeadLine('#coordPaneHeader', 'menuPaneHeadline', 'Coordinates');

// Adding the drop-down icon to the coordinates pane header
addIconToMenuHeader('#coordPaneHeader', 'coordPaneDropDownIcon', 'dropDownIcon', dropDownIcon());

// Adding the coordinates list <div> element
addChildToParent('#coordPane', 'div', 'coordListDiv');

// Adding the coordinates list <ol> element
addChildToParent('#coordListDiv', 'ol', 'coordList');

// Adding all elements to the coordinates list
addAllCoords();



/***********************
 *** FACILITIES PANE ***
 ***********************/


/*** Functions ***/

// Adds a facility icon to a facility row
function addFacilIcon(parentRowId, childId, facilIconFile) {
    let parentRow = document.querySelector(parentRowId);
    let newFacilIcon = document.createElement('img');

    newFacilIcon.src = './icons/' + facilIconFile;
    newFacilIcon.id = childId;
    newFacilIcon.className = 'facilIcon';

    newFacilIcon.style.filter = 'grayscale(100%)';

    parentRow.appendChild(newFacilIcon);
}


/*** Constructing the facility pane ***/

// Adding the facility menu pane
addChildToParent('#menuPane', 'div','facilPane', 'menuPaneStyle');

// Adding facilities header pane
addChildToParent('#facilPane', 'div', 'facilPaneHeader', 'menuPaneHeader');

// Adding a headline to the facilities header pane
addMenuPaneHeadLine('#facilPaneHeader', 'facilPaneHeadline', 'Facilities');

// Adding a drop-down icon
addIconToMenuHeader('#facilPaneHeader', 'facilPaneDropDownIcon', 'dropDownIcon', dropDownIcon());

// Adding the element that drops down
addChildToParent('#facilPane', 'div', 'facilPaneDropDown');

// Adding the facility rows
// Row 1
addChildToParent('#facilPaneDropDown', 'div', 'facilRow1', 'row');

// Adding icons to row 1
addFacilIcon('#facilRow1', 'baalhytteIcon', 'baalhytteIconSVG.svg');
addFacilIcon('#facilRow1', 'baalpladsIcon', 'baalpladsIconSVG.svg');
addFacilIcon('#facilRow1', 'friTeltningIcon', 'friTeltningIconSVG.svg');
addFacilIcon('#facilRow1','fritFiskeriIcon', 'fritFiskeriIconSVG.svg');


// Row 2
addChildToParent('#facilPaneDropDown', 'div', 'facilRow2', 'row');

// Adding icons to row 2
addFacilIcon('#facilRow2', 'hkLundIcon', 'haengekoejelundIconSVG.svg');
addFacilIcon('#facilRow2', 'nationalparkIcon', 'nationalparkIconSVG.svg');
addFacilIcon('#facilRow2', 'naturparkIcon', 'naturparkIconSVG.svg');
addFacilIcon('#facilRow2', 'shelterIcon', 'shelterSVG.svg');


// Row 3
addChildToParent('#facilPaneDropDown', 'div', 'facilRow3', 'row');

// Adding icons to row 3
addFacilIcon('#facilRow3', 'spejderhytteIcon', 'spejderhytteIconSVG.svg');
addFacilIcon('#facilRow3', 'teltpladsIcon', 'teltPladsIconSVG.svg');
addFacilIcon('#facilRow3', 'tmIcon', 'toervejrsrum:madpakkehusIconSVG.svg');
addFacilIcon('#facilRow3', 'vandpostIcon', 'vandpostIconSVG.svg');


// Row 4
addChildToParent('#facilPaneDropDown', 'div', 'facilRow4', 'row');

// Adding remaining icon to row 4
addFacilIcon('#facilRow4', 'wcIcon', 'wcSVG.svg');



/**********************
 *** MOUSE LOCATION ***
 **********************/
// Adding the mouse location element
addChildToParent('#menuPane', 'div', 'mouseLoc', 'menuPaneStyle');


/***********************
 *** Event listeners ***
 ***********************/

// Dropping down the coordinates list
document.querySelector("#coordPaneDropDownIcon").addEventListener('click', () => {
    menuDropDown('#coordListDiv', '#coordPaneDropDownIcon');});

// Dropping down the facilities menu
document.querySelector('#facilPaneDropDownIcon').addEventListener('click', () => {
    menuDropDown('#facilPaneDropDown', '#facilPaneDropDownIcon');});

// Showing the location of the mouse
map.on('mousemove', (event) => {
    document.querySelector('#mouseLoc').textContent = latlngToString(event.latlng);});

// Switching between DMS and DD
document.querySelector('#mouseLoc').addEventListener('click', () => {
    dmsStatus = !dmsStatus; });