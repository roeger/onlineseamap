onc.MapDownload = onc.MapDownload || {
    featureOverlay : undefined,
    selectedName : undefined,
    selectedLink : undefined,
    select : undefined,
};

onc.MapDownload.addPanel = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    var sidebar = document.getElementById('sidebar');
    var download = document.createElement('div');
    var downloadbutton = document.createElement('INPUT');
    var mapnamefield = document.createElement('div');
    element.id = 'mapdownload';
    element.className = 'mapdownload';
    element.setAttribute("hidden", "hidden"); 
    sidebar.appendChild(element);
    mapnamefield.id = "mapnamefield";
    mapnamefield.innerHTML = "Select a map";
    element.appendChild(mapnamefield);
    
    var addRadioButton = function(filetype, checked) {
        var entry = document.createElement('div');
        entry.class = "mapfiletype";
        var radio = document.createElement('input');
        radio.setAttribute("type", "radio"); 
        radio.setAttribute("name", "filetype"); 
        radio.setAttribute("value", filetype);
        if (checked)
            radio.checked = true;
        entry.appendChild(radio);
        var span = document.createElement('span');
        span.innerHTML = filetype;
        entry.appendChild(span);
        download.appendChild(entry);
    };
    var types = ['png', 'kap', 'jpr', 'kmz', 'cal'];
    for (var i = 0; i < types.length; ++i)
        addRadioButton(types[i], i === 0);

    downloadbutton.id = 'mapdownloadbutton';
    downloadbutton.addEventListener('click', function(evt) {onc.MapDownload.download();});
    downloadbutton.setAttribute("type", "image"); 
    downloadbutton.setAttribute("src", "icons/data-transfer-download-2x.png"); 
    downloadbutton.disabled = true;
    downloadbutton.setAttribute("disabled", "disabled"); 
    download.appendChild(downloadbutton);
    element.appendChild(download);
};

onc.MapDownload.showOrHideButton = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('a');
    element.className = 'mapdownloadicon';
    element.setAttribute("title", "Map download");
    onc.MapDownload.addPanel();

    element.addEventListener('click', function(e) {
        var mapdownload = document.getElementById('mapdownload');
        if (mapdownload.getAttribute("hidden") == null) {
            onc.MapDownload.stop();
        } else {
            onc.stopAllSidebarServices();
            onc.MapDownload.start();
        }},
       false);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(onc.MapDownload.showOrHideButton, ol.control.Control);

onc.MapDownload.parseXML = function(filename) {
    var xmlhttp, xmlDoc;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filename, false);
    xmlhttp.send();
    return xmlhttp.responseXML;
}

onc.MapDownload.registerControl = function() {
    var xmlDoc = this.parseXML("map_download.xml", "xml");
    var root = xmlDoc.getElementsByTagName("maps")[0];
    var items = root.getElementsByTagName("map");

    var geometry = function(item) {
        var vals = ["west", "south", "east", "north"];
        var extent = []
        for (var i = 0; i < 4; i++) {
            var node = item.getElementsByTagName(vals[i])[0].childNodes[0];
            extent.push(parseFloat(node.nodeValue));
        }
        var polygon = new ol.geom.Polygon.fromExtent(extent);
        polygon.transform('EPSG:4326', onc.map.getView().getProjection());
        return polygon;
    }

    var collection = new ol.Collection();
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var feature = new ol.Feature({
          geometry: geometry(item),
          name: item.getElementsByTagName("name")[0].childNodes[0].nodeValue.trim(),
          link: item.getElementsByTagName("link")[0].childNodes[0].nodeValue.trim(),
          category: item.getElementsByTagName("category")[0].childNodes[0].nodeValue.trim(),
        });
        collection.push(feature);
    }

    onc.MapDownload.featureOverlay = new ol.layer.Vector({
        source : new ol.source.Vector({ features: collection}),
    });
    onc.sidebarservices.push(onc.MapDownload);
    
    this.select = new ol.interaction.Select({condition: ol.events.condition.click});
    this.select.getFeatures().on('add', function(evt) {
        f = evt.element;
        if (f) {
            onc.MapDownload.selectedName = f.get('name');
            onc.MapDownload.selectedLink = f.get('link');
            document.getElementById('mapnamefield').innerHTML = f.get('name');
            var downloadbutton = document.getElementById('mapdownloadbutton');
            downloadbutton.disabled = false;
            downloadbutton.removeAttribute("disabled"); 
        }
    });
   
    var ctrl = new this.showOrHideButton({target: 'showmapdownload'});
    onc.map.addControl(ctrl);
};

onc.MapDownload.start = function() {
    document.getElementById('mapdownload').removeAttribute("hidden");
    this.featureOverlay.setMap(onc.map);
    onc.map.addInteraction(this.select);
}

onc.MapDownload.stop = function() {
    this.featureOverlay.setMap(null);
    onc.map.removeInteraction(this.select);
    document.getElementById('mapdownload').setAttribute("hidden", "hidden");
}
            
onc.MapDownload.download = function() {
    var filetype = $('input[name=filetype]:checked').val();
    var base = "http://sourceforge.net/projects/opennautical/files/Maps";
    var add = ".";
    if (filetype === "cal")
        add = "_png" + add;
    var url = base + this.selectedLink + "ONC-" + this.selectedName + add + filetype + "/download";
    var url = base + this.selectedLink + "ONC-" + f.get('name') + add + filetype + "/download";
    console.log(url);
    window.open(url);
}
