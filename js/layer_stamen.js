onc.Stamen = onc.Stamen || {
    queryKey : 'lq',
};

onc.Stamen.registerLayers = function(queryValues) {
    var key = "stamen";
    var show = onc.evaluateLayerVisibility(queryValues, this.queryKey, key, false);
    var layer_base = new ol.layer.Tile({
        source: new ol.source.Stamen({
            layer: 'watercolor'
        }),
        name: 'Watercolor',
    });
    
    var layer_labels = new ol.layer.Tile({
        source: new ol.source.Stamen({
            layer: 'terrain-labels'
        }),
        name: 'Labels (U.S. only)',
    });
    var group = new ol.layer.Group({
        layers: [layer_base, layer_labels],
        name: "Watercolor",
        visible: show,
    });
    group.isBaseLayer = true;
    onc.addCookieUpdater(group, key);
    onc.map.addLayer(group);
    this.layer = group;
};

onc.Stamen.updateQueryParam = function(query) {
    query[this.queryKey] = this.layer.getVisible() ? 's' : 'h';
}
