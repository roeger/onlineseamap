onc.getQueryValues = function() {
    var queryValues = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0; i<vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair.length === 2)
            queryValues[pair[0]] = pair[1];
    }
    return queryValues;
};

onc.stopAllSidebarServices = function() {
    for (var i = 0; i < onc.sidebarservices.length; i++)
        onc.sidebarservices[i].stop();
};

onc.coordinateToString = function(coordinate) {
    return onc.degreesToString(coordinate[1], ["S","N"]) +
           onc.degreesToString(coordinate[0], ["W","E"]);
};

onc.degreesToString = function (degrees, hemispheres) {
    var padWithZeros = function(no, length) {
        no = no + '';
        return no.length >= length ? no : new Array(length - no.length + 1).join('0') + no;
    };
    var normalizedDegrees = ((degrees + 180) % 360) - 180;
    var sec = Math.abs(Math.round(3600 * normalizedDegrees));
    var result = '';
    var pos = degrees < 0 ? 0 : 1;
    var padding = hemispheres[0] === 'W' ? 3 : 2;
    var min = (sec/60)%60;
    var result = hemispheres[pos];
    result += padWithZeros(Math.floor(sec/3600), padding) + '\u00b0';
    result += padWithZeros(Math.floor(min), 2) + ".";
    result += padWithZeros(Math.floor(((sec % 60)/60)*1000), 3) + '\u2032 ';
    return result;
}

onc.degreesToStringShort = function(degrees, hemispheres) {
    var normalizedDegrees = ((degrees + 180) % 360) - 180;
    var sec = Math.abs(Math.round(3600 * normalizedDegrees));
    var min = (sec/60)%60;
    var result = Math.floor(sec/3600) + '\u00b0';
    if (!min)
        return result;
    if (min%1 === 0) // min is integer
        return result + min + '\u2032 ';
    return result + min.toFixed(1) + '\u2032 ';
}


onc.getCookie = function(key) {
    var name = key + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

onc.setCookie = function(key, value, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = key + "=" + value + "; " + expires + "; path=/";
}

onc.addCookieUpdater = function(layer, key) {
    layer.addEventListener('change:visible', function(e) {
        var val = e.currentTarget.getVisible() ? "show" : "hide";
        onc.setCookie(key, val, 180);
    });
}


onc.evaluateLayerVisibility = function(queryValues, queryKey, cookieKey,
                                       defaultVal) {
    if (queryValues[queryKey] === 's')
        return true;
    if (queryValues[queryKey] === 'h')
        return false;
    return onc.showLayerAccordingToCookie(cookieKey, defaultVal);
}

onc.showLayerAccordingToCookie = function(key, defaultValue) {
    if (defaultValue)
        return !(onc.getCookie(key) === 'hide');
    return onc.getCookie(key) === 'show';
}

onc.round = function(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number*factor)/factor;
};
