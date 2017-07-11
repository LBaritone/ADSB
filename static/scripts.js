// Google Map
var map;

// markers for map
var markers = [];

// info window
var info = new google.maps.InfoWindow();

// execute when the DOM is fully loaded
$(function() {

    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    var styles = [];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: -30.240722, lng: -70.7387717}, // Cerro Pachon, Chile
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 7,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);
    
    // add marker for telescope
    cerroPachon = new google.maps.Marker({
        position: {lat: -30.240722, lng: -70.7387717} ,
        label: {
            text: "Cerro Pachón",
            fontSize: "10px"
        },
        map: map,
        icon: {
            url: "../static/observatory.png",
        }
    });

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

});

/**
 * Adds marker for plane to map.
 */
function addMarker(plane)
{
    var pos;
    var call;

    alert("inside addMarker");

    // check if plane has a position
    if (!plane.hasOwnProperty("Lat") && !plane.hasOwnProperty("Long")) {
        return;
    } 
    
    pos = {lat: plane["Lat"], lng: plane["Long"]};  

    if (plane.hasOwnProperty("Call")) {
        call = plane["Call"];
    } else {
        call = "Unknown";
    }

    // declare a new marker for current position of plane
    var marker = new google.maps.Marker({
        position: pos,
        label: call,
        map: map,
    });
    
    // listen for a click on an icon and then display call number of plane
    marker.addListener('click', function() {
        var content = "<p>";
        content += call + " @ (" + pos["lat"] + ", " + pos["lng"] + ")";
        content += "</p>";
        
        // create/display window
        showInfo(marker, content);
    });
    
    // add this marker to markers 
    markers.push(marker);
}

/**
 * Configures application.
 */
function configure()
{
    setInterval(update(), 30000);
}

/**
 * Removes markers from map.
 *
 * change function to convert current marker to path dot
 */
function removeMarkers()
{
    // close every marker in markers
    // https://javascriptweblog.wordpress.com/2010/10/11/rethinking-javascript-for-loops/
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
}

/**
 * Shows info window at marker with content.
 */
function showInfo(marker, content)
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) == "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='/static/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // end div
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(map, marker);
}

/**
 * Updates UI's markers.
 *
 * update every interval
 */
function update() 
{
    $.getJSON(Flask.url_for("update"))
    .done(function(data, textStatus, jqXHR) {

       // remove old markers from map
       removeMarkers();
       console.log(data);
       console.log(Object.keys(data).length);

       // add new markers to map
       for (var i = 0; i < data.length; i++)
       {
           addMarker(data[i]);
       }

       // remember to also convert past current markers to dots 
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
};
