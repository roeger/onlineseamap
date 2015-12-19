onc.TripPlanner = onc.TripPlanner || {
    collection : new ol.Collection(),
    featureOverlay : null,
    draw : null,
    routeInfo : [],
};

onc.TripPlanner.addPanel = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    var sidebar = document.getElementById('sidebar');
    var table = document.createElement('table');
    var clearbutton = document.createElement('INPUT');
    var route = document.createElement('div');
    var download = document.createElement('div');
    var downloadbutton = document.createElement('INPUT');
    element.id = 'tripplanner';
    element.className = 'tripplanner';
    element.setAttribute("hidden", "hidden"); 
    sidebar.appendChild(element);

    var addTableRow = function(table, label) {
        var index = table.rows.length;
        var row = table.insertRow(index);
        row.insertCell(0).innerHTML = label;
        row.cells[0].setAttribute('class', 'label');
        row.insertCell(1);
    }

    table.id = 'tripplannertable';
    addTableRow(table, "Start");
    addTableRow(table, "Finish");
    addTableRow(table, "Distance");
    element.appendChild(table);
    
    clearbutton.addEventListener('click', function(evt) {onc.TripPlanner.clear();});
    clearbutton.setAttribute("type", "button"); 
    clearbutton.setAttribute("value", "Clear"); 
    element.appendChild(clearbutton);

    route.id = 'route';
    element.appendChild(route);

    this.updateRoute();

    var addRadioButton = function(filetype, checked) {
        var radio = document.createElement('input');
        radio.setAttribute("type", "radio"); 
        radio.setAttribute("name", "filetype"); 
        radio.setAttribute("value", filetype);
        if (checked)
            radio.checked = true;
        download.appendChild(radio);
        var span = document.createElement('span');
        span.innerHTML = filetype;
        download.appendChild(span);
    }; 
    addRadioButton('CSV', true);
    addRadioButton('KML');
    addRadioButton('GML');
    
    downloadbutton.id = 'tripplannerdownload';
    downloadbutton.addEventListener('click', function(evt) {onc.TripPlanner.download();});
    downloadbutton.setAttribute("type", "image"); 
    downloadbutton.setAttribute("src", "icons/data-transfer-download-2x.png"); 
    download.appendChild(downloadbutton);
    element.appendChild(download);
};

onc.TripPlanner.showOrHideButton = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('a');
    element.className = 'tripplannericon';
    element.setAttribute("title", "Trip planner");
    onc.TripPlanner.addPanel();

    element.addEventListener('click', function(e) {
        var planner = document.getElementById('tripplanner');
        if (planner.getAttribute("hidden") == null) {
            onc.TripPlanner.stop();
        } else {
            onc.stopAllSidebarServices();
            onc.TripPlanner.start();
        }},
       false);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(onc.TripPlanner.showOrHideButton, ol.control.Control);

onc.TripPlanner.registerControl = function() {
    onc.TripPlanner.featureOverlay = new ol.layer.Vector({
        source : new ol.source.Vector({
            features: onc.TripPlanner.collection,
            useSpatialIndex: false
        }),
        style : new ol.style.Style({
            fill : new ol.style.Fill({
                color : 'rgba(255, 255, 255, 0.2)'
            }),
            stroke : new ol.style.Stroke({
                color : '#003C88',
                width : 2
            }),
            image : new ol.style.Circle({
                radius : 7,
                fill : new ol.style.Fill({
                    color : '#ffcc33'
                })
            })
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true
    });
    onc.sidebarservices.push(onc.TripPlanner);
   
    this.draw = new ol.interaction.Draw({
        features: this.collection,
        type: 'LineString',
    });
    this.draw.setActive(false);
    onc.map.addInteraction(this.draw);
    this.modify = new ol.interaction.Modify({
        features: this.collection,
    });
    this.modify.setActive(false);
    onc.map.addInteraction(this.modify);
    
    this.modify.on('modifyend', function (evt) {
        onc.TripPlanner.updateRoute();
    });
    
    
    this.collection.on('add', function (evt) {
        onc.TripPlanner.updateRoute();
    });
    
    this.collection.on('remove', function (evt) {
        onc.TripPlanner.updateRoute();
    });
    
    this.draw.on('drawend', function (evt) {
        onc.TripPlanner.draw.setActive(false);
        onc.TripPlanner.modify.setActive(true);
        onc.TripPlanner.updateRoute();
    });
    
    var ctrl = new this.showOrHideButton({target: 'showtripplanner'});
    onc.map.addControl(ctrl);
};

onc.TripPlanner.initialBearing = function(coord1, coord2) {
    var radians = function(degree) {
        return degree * Math.PI/180;
    }
    var degrees = function(radians) {
        return radians / (Math.PI/180);
    }
    phi1 = radians(coord1[1]); 
    phi2 = radians(coord2[1]); 
    lambda1 = radians(coord1[0]); 
    lambda2 = radians(coord2[0]);
    var x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
    var y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
    var val = Math.atan2(y, x);
    return degrees(val); 
}

onc.TripPlanner.updateRoute = function() {
    var table = document.getElementById('tripplannertable');
    var route = document.getElementById('route');
    while (route.firstChild)
        route.removeChild(route.firstChild);
    this.routeInfo = [];
    if (this.collection.getLength() === 0) {
        table.rows[0].cells[1].innerHTML = '&mdash;'; 
        table.rows[1].cells[1].innerHTML = '&mdash;'; 
        table.rows[2].cells[1].innerHTML = '&mdash; nm';
    } else {
        var wgs84Sphere= new ol.Sphere(6378137);
        var linefeature = this.collection.item(0);
        var coords = linefeature.getGeometry().getCoordinates();
        var next = coords[0];
        var pos = ol.proj.transform(next, 'EPSG:3857', 'EPSG:4326')
        var total_distance = 0;
        table.rows[0].cells[1].innerHTML = onc.coordinateToString(pos).replace(' ', '<br/>');
        var position = document.createElement('div');
        position.className = 'position';
        var stringPos = onc.coordinateToString(pos);
        position.innerHTML = stringPos;
        route.appendChild(position);


        for (var i = 1; i < coords.length; i++) {
            var last = next;
            var last_4326 = pos;
            var lastStringPos = stringPos;
            next = coords[i];
            var pos = ol.proj.transform(next, 'EPSG:3857', 'EPSG:4326')
            var entry = document.createElement('div');
            entry.className = 'routesegment';
            var distance_meter = wgs84Sphere.haversineDistance(last_4326, pos);
            var distance_nm = distance_meter * 0.000539957;
            total_distance += distance_nm;
            var initialbearing = this.initialBearing(last_4326, pos);
            var finalbearing = (this.initialBearing(pos,last_4326) + 180)%360;
//            var initialbearing = wgs84Sphere.initialBearing(last_4326, pos);
//            var finalbearing = wgs84Sphere.finalBearing(last_4326, pos);
            entry.innerHTML = onc.round(distance_nm, 2) + ' nm<br/>' +
                'initial bearing ' + onc.round((initialbearing + 360)%360, 2) + '\u00b0<br/>' + 
                'final bearing ' + onc.round((finalbearing + 360)%360, 2) + '\u00b0';
            route.appendChild(entry);
            stringPos = onc.coordinateToString(pos);
            position = document.createElement('div');
            position.className = 'position';
            position.innerHTML = stringPos;
            route.appendChild(position);
            this.routeInfo.push([i, lastStringPos, stringPos,
                                 distance_nm,
                                 (initialbearing+360)%360,
                                 (finalbearing+360)%360]);
        }
        table.rows[1].cells[1].innerHTML = onc.coordinateToString(pos).replace(' ', '<br/>');
        table.rows[2].cells[1].innerHTML = onc.round(total_distance, 2) + ' nm'; 
    }
}

onc.TripPlanner.start = function() {
    var panel = document.getElementById('tripplanner');
    panel.removeAttribute("hidden");
    this.featureOverlay.setMap(onc.map);
    if (this.featureOverlay.getSource().getFeatures().length == 0)
        this.draw.setActive(true);
    else
        onc.TripPlanner.modify.setActive(true);
}

onc.TripPlanner.stop = function() {
    this.featureOverlay.setMap(null);
    this.draw.setActive(false);
    var panel = document.getElementById('tripplanner');
    panel.setAttribute("hidden", "hidden");
}

onc.TripPlanner.clear = function() {
    this.collection.clear();
    this.updateRoute();
    this.start();
}
            
onc.TripPlanner.download = function() {
    var filetype = $('input[name=filetype]:checked').val();
    var data;
    var route = this.collection.item(0);
    switch (filetype) {
        case "GML": // does not work as intended?
            var gml = new ol.format.GML3({
                featureType: 'LineString',
                featureNS: 'http://www.opengis.net/gml',
            });
            data = gml.writeFeatures([route], {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            break;
        case "KML":
            var kml = new ol.format.KML();
            data = kml.writeFeatures([route], {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            break;
        case "CSV":
            var csv = ['No;Starting position;Destination position;Distance (nm);Initial bearing;Final bearing'];
            for (var i = 0; i < this.routeInfo.length; i++)
                csv.push(this.routeInfo[i].join(';'));
            data = csv.join('\n');
    }
    var blob = new Blob([data], {type: 'octet/stream'});
    var filename = 'route.' + filetype.toLowerCase();
    saveAs(blob, filename);
}
