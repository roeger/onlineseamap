onc.OpenStreetMap = onc.OpenStreetMap || {
    queryKey : 'lo',
    registerLayers : function(queryValues) {
        var key = 'openstreetmap';
        var show = onc.evaluateLayerVisibility(queryValues, this.queryKey, key, true);
        var layer =  new ol.layer.Tile({
            source: new ol.source.OSM(),
            name: "OpenStreetMap",
            visible: show,
        });
        layer.isBaseLayer = true;
        onc.addCookieUpdater(layer, key);
        onc.map.addLayer(layer);
        this.layer = layer;
    }
};

onc.OpenStreetMap.updateQueryParam = function(query) {
    query[this.queryKey] = this.layer.getVisible() ? 's' : 'h';
}
