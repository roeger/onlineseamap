onc.LayerSelector = onc.LayerSelector || {};

onc.LayerSelector.showOrHideLayerSelector = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('a');
    element.className = 'layerselectoricon';
    element.setAttribute("title", "View");
    onc.LayerSelector.addLayerSelectorPanel(options.layers);
    
    element.addEventListener('click', function(e) {
        var panel = document.getElementById('layerselector');
        if (panel.getAttribute("hidden") === null)
            panel.setAttribute("hidden", "hidden");
        else {
            onc.stopAllSidebarServices();
            onc.LayerSelector.start();
        }
        }, 
       false);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(onc.LayerSelector.showOrHideLayerSelector, ol.control.Control);

onc.LayerSelector.addLayerSelectorPanel = function(layers) {
    var sidebar = document.getElementById('sidebar');
    var element = document.createElement('div');
    var label = document.createElement("span");
    var select = document.createElement("select");
    element.id = 'layerselector';
    element.setAttribute("title", "Layers");
    element.setAttribute("hidden", "hidden"); 
    sidebar.appendChild(element);
    label.id = 'layerselectorbaselabel';
    label.innerHTML = 'Base layer:';
    element.appendChild(label);
    element.appendChild(select);
    var addSelectorForLayer = function(elem, index, parentElement) {
        var div = document.createElement("div");
        var checkbox = document.createElement("INPUT");
        var label = document.createTextNode(elem.get('name'));
        var layers = elem.get('layers');
        div.className = 'layerselectorentry';
        checkbox.setAttribute("type", "checkbox"); 
        checkbox.setAttribute("name", elem.get('name'));
        if (elem.getVisible())
            checkbox.setAttribute("checked", "checked"); 
        checkbox.setAttribute("value", index); 
        checkbox.addEventListener('click', function(e) {
            var showChildren = e.currentTarget.checked ? 'block' : 'none';
            elem.setVisible(e.currentTarget.checked);
            next =  e.currentTarget.nextElementSibling;
            while (goog.isDefAndNotNull(next)) {
                next.style.display = showChildren;
                next = next.nextElementSibling;
            }
        });
        div.appendChild(checkbox);
        div.appendChild(label);
        if (goog.isDefAndNotNull(layers)) {
            var subdiv = document.createElement("div");
            div.appendChild(subdiv);
            if (!elem.getVisible())
                subdiv.style.display = 'none';
            if (goog.isDefAndNotNull(elem.selectorEntryFunction)) {
                var groupOption = elem.selectorEntryFunction();
                subdiv.appendChild(groupOption);
            }
            for (var i = 0; i < layers.getLength(); i++)
                addSelectorForLayer(layers.item(i), i, subdiv);
        }
        parentElement.appendChild(div);
    };
    for (var i = 0; i < layers.getLength(); i++) {
        var layer = layers.item(i);
        if (goog.isDefAndNotNull(layer.isBaseLayer) &&
            layer.isBaseLayer) {
            var option = document.createElement("option");
            option.setAttribute("value", i);
            option.innerHTML = layer.get('name');
            if (layer.getVisible())
                option.setAttribute("selected", "selected");
            select.appendChild(option);
        } else {
            addSelectorForLayer(layer, i, element);
        }
    }
    select.addEventListener('change', function(e) {
        for (var i = 0; i < layers.getLength(); i++) {
            var layer = layers.item(i);
            if (goog.isDefAndNotNull(layer.isBaseLayer) &&
                layer.isBaseLayer) {
                layer.setVisible(e.target.value == i);
            }
        }
    });
};

onc.LayerSelector.registerControl = function() {
    var layers = onc.map.getLayers();
    onc.map.addControl(new onc.LayerSelector.showOrHideLayerSelector({target: 'showlayerselector', layers: layers}));
    onc.sidebarservices.push(onc.LayerSelector);
};

onc.LayerSelector.start = function() {
    var panel = document.getElementById('layerselector');
    panel.removeAttribute("hidden");
}

onc.LayerSelector.stop = function() {
    var panel = document.getElementById('layerselector');
    panel.setAttribute("hidden", "hidden");
}
