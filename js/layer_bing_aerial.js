onc.BingAerial = onc.BingAerial || {
    queryKey : 'la'
};

onc.BingAerial.registerLayers = function(queryValues) {
    var key = 'aerial';
    var show = onc.evaluateLayerVisibility(queryValues, this.queryKey, key, false);
    var layer = new ol.layer.Tile({
        name: 'Aerial photo',
        visible: show,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: 'AuA1b41REXrEohfokJjbHgCSp1EmwTcW8PEx_miJUvZERC0kbRnpotPTzGsPjGqa',
            imagerySet: 'AerialWithLabels'
        })
    });
    layer.isBaseLayer = true;
    onc.addCookieUpdater(layer, key);
    onc.map.addLayer(layer);
    this.layer = layer;
};

onc.BingAerial.updateQueryParam = function(query) {
    query[this.queryKey] = this.layer.getVisible() ? 's' : 'h';
}

