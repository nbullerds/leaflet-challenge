// Store our API endpoint inside queryUrl
var quakeDataUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var plateDataUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(quakeDataUrl).then(function(quakeData) {
    d3.json(plateDataUrl).then(function(plateData) {
         // Once we get a response, send the data.features object to the createFeatures function
        createMap(quakeData.features, plateData.features);
    });
});

function getColor(d){
    return d >= 90  ? '#A63603' :
           d >= 70  ? '#E6550D' :
           d >= 50   ? '#FD8D3C' :
           d >= 30   ? '#FDAE6B' :
           d >= 10   ? '#FDD0A2' :
                      '#FEEDDE';
}

function createMap(earthquakeData, plateData) {
    
    // An array which will be used to store created quakeMarkers
    var quakeMarkers = []
    earthquakeData.forEach(function (quake) {
        var lng = quake.geometry.coordinates[0];
        var lat = quake.geometry.coordinates[1];
        var depth = quake.geometry.coordinates[2];
        var mag = quake.properties.mag * 30000;
        quakeMarkers.push(
            L.circle([lat, lng],{
                weight: 1,
                fillOpacity: 1,
                color: "black",
                fillColor: getColor(depth),
                radius: mag
            }).bindPopup("<h3>" + quake.properties.place +
            "</h3><hr><h4>Magnitude: " + quake.properties.mag +", Depth: " + depth + "</h4><p>" + new Date(quake.properties.time) + "</p>")
        );
        
    });

    // layer group created to be added to overlay
    var quakeLayer = L.layerGroup(quakeMarkers);

    // Once we get a response, send the data.features object to the createFeatures function
    console.log(plateData.features);
    var plateLayer = L.geoJson(plateData, {
        style: function(feature) {
            return {
            color: "orange",
            weight: 1.5
            };
        }
    });


    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    console.log(plateLayer);
    console.log(quakeLayer);
      // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satelliteMap,
        "Grayscale": grayscaleMap,
        "Outdoors" : outdoorMap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": quakeLayer,
        "Tectonic Plates": plateLayer
    };

    // Create our map object
    var map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [satelliteMap, quakeLayer, plateLayer]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);

    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map){

        var div = L.DomUtil.create('div', 'info legend');
        var grades = [-10, 10, 30, 50, 70, 90];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(map);
}