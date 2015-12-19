onc.Search = onc.Search || {};

onc.Search.SearchResults = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    var searchfield = document.createElement('INPUT');
    var results = document.createElement('div');
    var sidebar = document.getElementById('sidebar');
    element.id = 'search';
    element.className = 'search';
    element.setAttribute("hidden", "hidden"); 
    searchfield.setAttribute("type", "text"); 
    searchfield.className = 'inputfield';
    results.id = 'searchresults';
    element.appendChild(results);
    element.appendChild(searchfield);
    function showSearchResults(searchstring) {
        while (results.hasChildNodes())
            results.removeChild(results.firstChild);
        $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=15&q='
        + searchstring, function(data) {
            var results = document.getElementById('searchresults');
            var foundresults = false;
            $.each(data, function(key, val) {
                var btn = document.createElement("a");
                btn.className = 'searchresult';
                var t = document.createTextNode(val.display_name);
                btn.appendChild(t);    
                btn.addEventListener('click', function(e) {
                    onc.map.getView().setCenter(ol.proj.transform([parseFloat(val.lon),
                    parseFloat(val.lat)], 'EPSG:4326',
                    'EPSG:3857'));
                });
                results.appendChild(btn);
                foundresults = true
            });

            if (foundresults === false) 
                results.appendChild(document.createTextNode("No results found"));
            });
    }
    searchfield.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) // on enter
            showSearchResults(e.target.value)});

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(onc.Search.SearchResults, ol.control.Control);

onc.Search.addSearchPanel = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('div');
    var sidebar = document.getElementById('sidebar');
    var searchfield = document.createElement('INPUT');
    var results = document.createElement('div');
    element.id = 'search';
    element.className = 'search';
    element.setAttribute("hidden", "hidden"); 
    sidebar.appendChild(element);
    searchfield.setAttribute("type", "text"); 
    searchfield.className = 'inputfield';
    results.id = 'searchresults';
    element.appendChild(results);
    element.appendChild(searchfield);
    function showSearchResults(searchstring) {
        while (results.hasChildNodes())
            results.removeChild(results.firstChild);
        $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=15&q='
        + searchstring, function(data) {
            var results = document.getElementById('searchresults');
            var foundresults = false;
            $.each(data, function(key, val) {
                var btn = document.createElement("a");
                var t = document.createTextNode(val.display_name);
                btn.className = 'searchresult';
                btn.appendChild(t);    
                btn.addEventListener('click', function(e) {
                    onc.map.getView().setCenter(ol.proj.transform([parseFloat(val.lon),
                    parseFloat(val.lat)], 'EPSG:4326',
                    'EPSG:3857'));
                });
                results.appendChild(btn);
                foundresults = true
            });

            if (foundresults === false) 
                results.appendChild(document.createTextNode("No results found"));
            });
    }
    searchfield.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) // on enter
            showSearchResults(e.target.value)});
};

onc.Search.showOrHideSearch = function(opt_options) {
    var options = opt_options || {};
    var element = document.createElement('a');
    element.className = 'searchicon';
    element.setAttribute("title", "Search");
    onc.Search.addSearchPanel();

    element.addEventListener('click', function(e) {
        var search = document.getElementById('search');
        if (search.getAttribute("hidden") === null)
            search.setAttribute("hidden", "hidden");
        else {
            onc.stopAllSidebarServices();
            onc.Search.start();
        }}, 
       false);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(onc.Search.showOrHideSearch, ol.control.Control);

onc.Search.registerControl = function() {
    var ctrl = new onc.Search.showOrHideSearch({target: 'showsearch'});
    onc.map.addControl(ctrl);
    onc.sidebarservices.push(onc.Search);
};

onc.Search.start = function() {
    var panel = document.getElementById('search');
    panel.removeAttribute("hidden");
}

onc.Search.stop = function() {
    var panel = document.getElementById('search');
    panel.setAttribute("hidden", "hidden");
}
