onc.ZoomLevel = onc.ZoomLevel || {};

onc.ZoomLevel.ZoomLevel = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    element.className = 'zoom_level';
    element.innerHTML = onc.map.getView().getZoom();

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

    onc.map.getView().on('change:resolution', function(evt) {
        var zoomInfo = onc.map.getView().getZoom();
        if (goog.isDefAndNotNull(zoomInfo))
            element.innerHTML = zoomInfo;
    });
};
ol.inherits(onc.ZoomLevel.ZoomLevel, ol.control.Control);

onc.ZoomLevel.registerControl = function() {
    var ctrl = new onc.ZoomLevel.ZoomLevel({target: onc.map.getControls().item(0).element});
    onc.map.addControl(ctrl);
};
