// Importing some variables to make this work on Github...
import { facilityCollection } from ./JS./GeoFAHandling.js';

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

// Swapping two element of an array.
function swapArrEl(arr, el1Idx, el2Idx) {
    // Swapping the elements.
    arr.splice(el1Idx, 1, arr.splice(el2Idx, 1, arr[el1Idx])[0]);
}


// Adding all necessary controls
function addCoordControls(usrWPObj) {
    let parent = document.querySelector(usrWPObj.html.id);

    // Containers.
    let controlsContainer = document.createElement('div');
    controlsContainer.className = 'controlsContainerClass';

    let upDownContainer = document.createElement('div');
    upDownContainer.className = 'upDownContainerClass';

    // Buttons.
    let deleteBtn = document.createElement('img');
    let upBtn = document.createElement('img');
    let downBtn = document.createElement('img');


    /*** Configuring the delete button ***/

    deleteBtn.id = parent.id + 'DeleteBtn';
    deleteBtn.src = './icons/deleteIconSVG.svg';
    deleteBtn.className = 'deleteBtnClass';

    // Adding an event listener to delete the coordinate.
    deleteBtn.addEventListener('click', () => {
        rmvUsrWP(usrWPObj);
        parent.remove();
    });

    // Adding it to the relevant container
    controlsContainer.appendChild(deleteBtn);


    /*** Configuring the up button ***/

    upBtn.id = parent.id + 'UpBtn';
    upBtn.src = './icons/upDownIconSVG.svg';
    // Making the up button point up.
    upBtn.style.transform = 'rotate(180deg)';
    upBtn.className = 'upBtnClass';

    // Adding an event listener to make the coordinate element move one up.
    upBtn.addEventListener('click', () => {
        let grandParentNode = parent.parentNode;
        let parentNode = controlsContainer.parentNode;

        // Swapping the relevant elements in the array.
        // Finding the index og the two elements to be swapped.
        let el1Idx = usrWPCollection.findIndex((obj) => obj.html.idName === parentNode.id);
        let el2Idx = usrWPCollection.findIndex((obj) => obj.html.idName === ((grandParentNode.firstChild === parentNode) ? grandParentNode.lastChild.id : parentNode.previousSibling.id));

        swapArrEl(usrWPCollection, el1Idx, el2Idx);

        // Moving the coordinate.
        grandParentNode.insertBefore(parentNode, parentNode.previousSibling);

        // Updating the directions.
        updateDirections();
    });


    /*** Configuring the down button ***/

    downBtn.id = parent.id + 'DownBtn';
    downBtn.src = upBtn.src;
    downBtn.className = 'downBtnClass';

    // Adding an event listener to make the coordinate element move one down.
    downBtn.addEventListener('click', () => {
        let grandParentNode = parent.parentNode;
        let parentNode = controlsContainer.parentNode;
        let el1Idx, el2Idx;

        // If the given coordinate is the last child, move it to the top.
        if (grandParentNode.lastChild === parentNode) {
            // Swapping the elements in the user waypoint collection.
            el1Idx = usrWPCollection.findIndex((obj) => obj.html.idName === parentNode.id);
            el2Idx = usrWPCollection.findIndex((obj) => obj.html.idName === grandParentNode.firstChild.id);

            swapArrEl(usrWPCollection, el1Idx, el2Idx);

            // Swapping the order in the coordinate pane.
            grandParentNode.insertBefore(parentNode, grandParentNode.firstChild);

        } else {
            el1Idx = usrWPCollection.findIndex((obj) => obj.html.idName === parentNode.id);
            el2Idx = usrWPCollection.findIndex((obj) => obj.html.idName === parentNode.nextSibling.nextSibling.id);

            swapArrEl(usrWPCollection, el1Idx, el2Idx);

            grandParentNode.insertBefore(parentNode, parentNode.nextSibling.nextSibling);
        }

        // Updating the directions.
        updateDirections();
    });



    // Adding the up and down buttons to the relevant container.
    upDownContainer.appendChild(upBtn);
    upDownContainer.appendChild(downBtn);

    // Adding the up and down container to the controls container.
    controlsContainer.appendChild(upDownContainer);

    // Adding the controls container to the parent.
    parent.appendChild(controlsContainer);



}


// Adding a coordinates element to the coordinates list.
function addCoordEl(usrWPObj) {
    let elParent = document.querySelector('#coordListDiv');
    let elContainer = document.createElement('div');
    let coord = document.createElement('input'); //TODO add an input for this later.
    let submit = document.createElement('input');


    /*** Configuring the element container ***/
    elContainer.id = usrWPObj.html.idName;
    usrWPObj.html.id = '#' + elContainer.id;
    elContainer.className = 'coordElContainer';


    /*** Configuring the coordinate element ***/
    coord.className = 'coordsStyle';
    coord.type = 'text';
    coord.name = usrWPObj.html.idName + 'Coord';
    coord.value = usrWPObj.geoJSON.geometry.coordinates.toString();

    // Adding the coordinate to the coordinate element container.
    elContainer.appendChild(coord);

    // Handling the submit button.
    submit.type = 'submit';
    submit.hidden = true;

    // Adding the submit button to the coordinate element container.


    // Adding everything to the coordinates list.
    elParent.appendChild(elContainer);

    /*** Controls ***/
    addCoordControls(usrWPObj);

}


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
    for (let i = 0; i < usrWPCollection.length; i++) {
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
//addChildToParent('#coordListDiv', 'ol', 'coordList');

// Adding all elements to the coordinates list
//addAllCoords();



/***********************
 *** FACILITIES PANE ***
 ***********************/


/*** Functions ***/

// Adds a facility icon to a facility row
function addFacilityIcon(parentRowId, facObj) {
    let parentRow = document.querySelector(parentRowId);
    let newIcon = document.createElement('img');

    // Configuring the new icon.
    newIcon.src = facObj.iconPath;
    newIcon.id = facObj.html.idName;
    newIcon.className = 'facilIcon';
    newIcon.style.filter = 'grayscale(100%)';

    // Setting the id of the new icon.
    facObj.html.id = '#' + newIcon.id;

    // Adding the new icon to HTML.
    parentRow.appendChild(newIcon);
}


// Adds all necessary rows and all available facilities.
function constructFacilityRows() {
    let facilityNo = 0;
    let rowNo = 0;
    let rowIdName, rowId;

    for (let prop in facilityCollection) {
        // Increment the relevant variables when four icons are present in the current row.
        if (facilityNo === 4) {
            facilityNo = 0;
            rowNo++;
        }

        // Creating a new row
        if (facilityNo === 0) {
            // Defining the id for the new row.
            rowIdName = 'facilRow' + rowNo;
            rowId = '#' + rowIdName;

            // Adding the new row to HTML.
            addChildToParent('#facilPaneDropDown', 'div', rowIdName, 'row');
        }

        // Adding a new to facility to HTML.
        addFacilityIcon(rowId, facilityCollection[prop]);

        // Adding an event listener to the new icon.
        addIconEventListener(facilityCollection[prop]);

        facilityNo++;
    }
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

// Adding the facility rows and icons.
constructFacilityRows();



/**********************
 *** MOUSE LOCATION ***
 **********************/
// Adding the mouse location element
addChildToParent('#menuPane', 'div', 'mouseLoc', 'menuPaneStyle');


/***********************
 *** Event listeners ***
 ***********************/

// Dropping down the coordinates list.
document.querySelector("#coordPaneDropDownIcon").addEventListener('click', () => {
    menuDropDown('#coordListDiv', '#coordPaneDropDownIcon');});

// Dropping down the facilities menu.
document.querySelector('#facilPaneDropDownIcon').addEventListener('click', () => {
    menuDropDown('#facilPaneDropDown', '#facilPaneDropDownIcon');});

// Showing the location of the mouse.
map.on('mousemove', (event) => {
    document.querySelector('#mouseLoc').textContent = latlngToString(event.latlng);});


// Switching between DMS and DD.
document.querySelector('#mouseLoc').addEventListener('click', () => {
    dmsStatus = !dmsStatus; });
