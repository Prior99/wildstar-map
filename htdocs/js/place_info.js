var _placeinfo;

function placeInfo(place, x, y) {
    var div = $("<div class='placeinfo'></div>")
        .css({
            "left" : (x-2) + "px",
            "top" : (y-2) + "px"
        })
        .appendTo("body")
        .append("<img src='icons/" + place.icon + "'/>")
        .append("<h1>" + place.name + "</h1>")
        .append("<h2>(" + place.category + ")</h2>");
    _placeinfo = div;
}

function removePlaceInfo() {
    if(_placeinfo) _placeinfo.remove();
}
