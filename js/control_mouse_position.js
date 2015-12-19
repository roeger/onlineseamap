onc.MousePosition = onc.MousePosition || {};

onc.MousePosition.registerControl = function() {
    var ctrl = new ol.control.MousePosition({
        coordinateFormat: onc.coordinateToString,
        projection: ol.proj.get('EPSG:4326')});
    onc.map.addControl(ctrl);
};
