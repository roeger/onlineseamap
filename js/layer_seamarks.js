onc.SeaMarks = onc.SeaMarks || {
    queryKey : 'ls',
};

onc.SeaMarks.registerLayers = function(queryValues) {
    var key = "seamarks";
    var show = onc.evaluateLayerVisibility(queryValues, this.queryKey, key, true);
    var layer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png'
        }),
        name: "Sea marks",
        visible: show,
    });
    onc.addCookieUpdater(layer, key);
    onc.map.addLayer(layer);
    this.layer = layer;
};

onc.SeaMarks.updateQueryParam = function(query) {
    query[this.queryKey] = this.layer.getVisible() ? 's' : 'h';
}
