// create earthquake and tectonic plate variables wiht query URLs to pull from
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// create new variables for the layer groups
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

// define variables for the tile layers and fill them; light, dark, and satellite
var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY

var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

// make baseMaps to hold layers of the maps
var baseMaps = {
    "Dark": darkMap,
    "Satellite": satelliteMap,
    "Light": lightMap
};

// create an overlay layer to hold the map layers
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonicPlates
};

// create the map, set the location for where the map starts
var myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 4,
    layers: [darkMap, earthquakes]
});

L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// use d3 to retrieve data
d3.json(earthquakesURL, function(earthquakeData) {
    // time to write functions to make this stuff FUNCTIONAL
    // function for marker size
    function markerSize(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 8
    }
    // function for style of marker based on earthquake magnitudes
    function styleInfo(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.properties.mag),
          color: "#000000",
          radius: markerSize(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
    // function to determine colors cause colors are PRETTY
    function chooseColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "#8B0000";
        case magnitude > 4:
            return "#9E1047";
        case magnitude > 3:
            return "#C70039";
        case magnitude > 2:
            return "#FF532E";
        case magnitude > 1:
            return "#FFC300";
        default:
            return "#CDF587";
        }
    }

    // add a layer for the feature array
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        // pop up funcationality to make that work 
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);

    // retrieve plates url to get tectonic plates
    d3.json(platesURL, function(plateData) {
        L.geoJson(plateData, {
            color: "#DC143C",
            weight: 2
        }).addTo(tectonicPlates);
        tectonicPlates.addTo(myMap);
    });

    // set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"), 
        magnitudeLevels = [0, 1, 2, 3, 4, 5];
        div.innerHTML += "<h3>Magnitude</h3>"
        for (var i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add Legend to the Map
    legend.addTo(myMap);
});

  