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
    var styles = [

        // hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        },

        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "off"}
            ]
        }

    ];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 42.3770, lng: -71.1256}, // Cambridge, MA
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

});

/**
 * Adds marker for place to map.
 */
function addMarker(place)
{
    // extract position and name of place
    var pos = {lat: place["latitude"], lng: place["longitude"]};
    var name = place["place_name"];
    var favs = [];
    
    // scale the gifs gleaned from https://cdn.cs50.net/2016/fall/video_projects/staff_gifs/harvard/gifs/
    // and a lot of HTML digging
    // http://stackoverflow.com/questions/15096461/resize-google-maps-marker-icon-image
    var dai = {
        url: "https://cdn.cs50.net/2016/fall/video_projects/staff_gifs/harvard/gifs/Xingchi-Dai.gif", 
        scaledSize: new google.maps.Size(40, 40),
    };
    var yu = {
        url: "https://cdn.cs50.net/2016/fall/video_projects/staff_gifs/harvard/gifs/Brian-Yu.gif", 
        scaledSize: new google.maps.Size(40, 40),
    };
    var malan = {
        url: 'https://cdn.cs50.net/2016/fall/video_projects/staff_gifs/harvard/gifs/David%20J.-Malan.gif',
        scaledSize: new google.maps.Size(40, 40),
    };
    favs.push(dai, yu, malan);
    
    // declare a new marker with random gif
    var marker = new google.maps.Marker({
        position: pos,
        label: name,
        map: map,
        // http://stackoverflow.com/questions/4550505/getting-random-value-from-an-array
        icon: favs[Math.floor(Math.random() * favs.length)]
    });
    
    // listen for a click on an icon and then display a window with 5 local articles
    marker.addListener('click', function() {
        var parameters = {
            geo: place["postal_code"]
        };
        // remember local articles for a given geo and construct html element
        $.getJSON(Flask.url_for("articles"), parameters)
        .done(function(data, textStatus, jqXHR) {
            // html element constructed via unordered list from staff solution html
            var content = "<ul>";
            data.forEach(function(headLine) {
                content += "<li> <a href=\"" + headLine["link"] + "\"";
                content += " target=\"_blank\">" + headLine["title"] + "</a> </li>";
            });
            content += "</ul>";
            
            // create/display window
            showInfo(marker, content);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            // log error to browser's console
            console.log(errorThrown.toString());
        });
    });
    
    // add this marker to markers 
    markers.push(marker);
}

/**
 * Configures application.
 */
function configure()
{
    // update UI after map has been dragged
    google.maps.event.addListener(map, "dragend", function() {

        // if info window isn't open
        // http://stackoverflow.com/a/12410385
        if (!info.getMap || !info.getMap())
        {
            update();
        }
    });

    // update UI after zoom level changes
    google.maps.event.addListener(map, "zoom_changed", function() {
        update();
    });

    // configure typeahead
    $("#q").typeahead({
        highlight: false,
        minLength: 1
    },
    {
        display: function(suggestion) { return null; },
        limit: 10,
        source: search,
        templates: {
            suggestion: Handlebars.compile(
                "<div>" +
                "{{place_name}}, {{admin_name1}}, {{postal_code}}" + 
                "</div>"
            )
        }
    });

    // re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // set map's center
        map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});

        // update UI
        update();
    });

    // hide info window when text box has focus
    $("#q").focus(function(eventData) {
        info.close();
    });

    // re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);

    // update UI
    update();

    // give focus to text box
    $("#q").focus();

    // update UI after map has been dragged
    // google.maps.event.addListener(map, "dragend", function() {

    //     // if info window isn't open
    //     // http://stackoverflow.com/a/12410385
    //     if (!info.getMap || !info.getMap())
    //     {
    //         update();
    //     }
    // });

    // update UI after zoom level changes
    // google.maps.event.addListener(map, "zoom_changed", function() {
    //     update();
    // });

    /**
    // configure typeahead
    $("#q").typeahead({
        highlight: false,
        minLength: 1
    },
    {
        display: function(suggestion) { return null; },
        limit: 10,
        source: search,
        templates: {
            suggestion: Handlebars.compile(
                "<div>" +
                "{{Call}} @ ({{Lat}}, {{Long}}})" + 
                "</div>"
            )
        }
    });

    // re-center map after plane is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // set map's center
        map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});

        // update UI
        update();
    });

    // hide info window when text box has focus
    $("#q").focus(function(eventData) {
        info.close();
    });
    

    // re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);
    */
}

/**
 * Removes markers from map.
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
 * Searches database for typeahead's suggestions.
 */
function search(query, syncResults, asyncResults)
{
    // get places matching query (asynchronously)
    var parameters = {
        q: query
    };
    $.getJSON(Flask.url_for("search"), parameters)
    .done(function(data, textStatus, jqXHR) {
     
        // call typeahead's callback with search results (i.e., places)
        asyncResults(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());

        // call typeahead's callback with no results
        asyncResults([]);
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
 */
function update() 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    var parameters = {
        ne: ne.lat() + "," + ne.lng(),
        q: $("#q").val(),
        sw: sw.lat() + "," + sw.lng()
    };
    $.getJSON(Flask.url_for("update"), parameters)
    .done(function(data, textStatus, jqXHR) {

       // remove old markers from map
       removeMarkers();

       // add new markers to map
       for (var i = 0; i < data.length; i++)
       {
           addMarker(data[i]);
       }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
};
