onc.PermaLink = onc.PermaLink || {
    query : {},
    viewListeners : []
};

onc.PermaLink.addPanel = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    var sidebar = document.getElementById('sidebar');
    var text = document.createElement('span');
    var input = document.createElement('textarea');
    element.id = 'permalink';
    element.className = 'permalink';
    element.setAttribute("hidden", "hidden"); 
    sidebar.appendChild(element);
    text.innerHTML = "Copy this URL for the current map view:";
    element.appendChild(text);
    input.setAttribute("readonly", "");
    input.id = 'currentPermalink';
    element.appendChild(input);
};

onc.PermaLink.showOrHideButton = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('a');
    element.className = 'permalinkicon';
    element.setAttribute("title", "Permalink");
    onc.PermaLink.addPanel();

    element.addEventListener('click', function(e) {
        var planner = document.getElementById('permalink');
        if (planner.getAttribute("hidden") === null) {
            onc.PermaLink.stop();
        } else {
            onc.stopAllSidebarServices();
            onc.PermaLink.start();
        }},
       false);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(onc.PermaLink.showOrHideButton, ol.control.Control);

onc.PermaLink.registerControl = function() {
    var ctrl = new this.showOrHideButton({target: 'showpermalink'});
    onc.map.addControl(ctrl);
    onc.sidebarservices.push(this);
};

onc.PermaLink.updateZoom_ = function() {
    this.query["z"] = onc.map.getView().getZoom();
}

onc.PermaLink.updateCenter_ = function() {
    this.query["c"] = onc.map.getView().getCenter();
}

onc.PermaLink.createCurrentQuery = function() {
    this.query = {};
    this.updateCenter_();    
    this.updateZoom_();    
    for (var i = 0; i < onc.layerManagers.length; i++) {
        onc.layerManagers[i].updateQueryParam(this.query);
    }
}

onc.PermaLink.updateCurrentField = function(query) {
    var queryParts = [];
    for (var key in query)
        queryParts.push(key + "=" + query[key]);
    var url = window.location.href.split('?')[0] + '?' + queryParts.join("&");
    var current = document.getElementById('currentPermalink');
    current.value = url;
    current.style.height = current.scrollHeight + "px";
}

onc.PermaLink.start = function() {
    var panel = document.getElementById('permalink');
    panel.removeAttribute("hidden");
    this.createCurrentQuery();
    this.updateCurrentField(this.query);
    var l = onc.map.getView().on('change:center', function(evt) {
            onc.PermaLink.updateCenter_();
            onc.PermaLink.updateCurrentField(onc.PermaLink.query);
        });
    this.viewListeners.push(l);
    l = onc.map.getView().on('change:resolution', function(evt) {
            onc.PermaLink.updateZoom_();
            onc.PermaLink.updateCurrentField(onc.PermaLink.query);
        });
    this.viewListeners.push(l);
    // We currently do not need listeners on the layers (for visibility)
    // because these can only be changed while the permalink tool is stoped.
}

onc.PermaLink.stop = function() {
    var panel = document.getElementById('permalink');
    panel.setAttribute("hidden", "hidden");
    for (var i = 0; i < this.viewListeners.length; i++)
        onc.map.getView().unByKey(this.viewListeners[i]);
    this.viewListeners = [];
}
