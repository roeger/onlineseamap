var onc = onc || {
    sidebarservices  : [],
    map : 'undefined'
};


onc.init = function() {
    onc.layerManagers = [onc.OpenStreetMap, onc.BingAerial, onc.Stamen,
                         onc.SeaMarks, onc.Weather]
    var queryValues = onc.getQueryValues();
    var zoom = parseInt(queryValues['z']) || 9;
    var centerStrings = (queryValues['c'] || "").split(',');
    var center = ol.proj.transform([9, 53.5], 'EPSG:4326', 'EPSG:3857');
    var x, y;
    if (centerStrings.length === 2 && (x = parseFloat(centerStrings[0])) &&
        (y = parseFloat(centerStrings[1])))
        center = [x, y];

    onc.map = new ol.Map({
        target: 'map',
        layers: [],
        renderer: 'canvas',
        view: new ol.View({
          center: center,
          zoom: zoom,
          minZoom: 1,
          maxZoom: 17
        }),
        controls: [
            new ol.control.Zoom(),
            new ol.control.Attribution({collapsible: false}),
            new ol.control.ScaleLine({className: 'scale-nautical', units: 'nautical'}),
            new ol.control.ScaleLine({className: 'scale-metric'}),
            new ol.control.FullScreen(),
            new ol.control.ZoomSlider()
        ]
      });

    for (var i = 0; i < onc.layerManagers.length; i++) {
        onc.layerManagers[i].registerLayers(queryValues);
    }
    

    onc.MousePosition.registerControl();
    onc.LayerSelector.registerControl();
    onc.Search.registerControl();
    onc.ZoomLevel.registerControl();
    onc.TripPlanner.registerControl();
    onc.PermaLink.registerControl();
//    Edit.registerControl();
};
