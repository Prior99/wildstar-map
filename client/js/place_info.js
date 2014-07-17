/*
 * placeinfo.js
 *
 * Will display a div with information about a selected place on the map.
 *
 * 2014 by Prior(Frederick Gnodtke) under the terms of GNU GPL
 */

var _placeinfo;

function placeInfo(place, x, y) {
	var div = $("<div class='placeinfo'></div>")
		.css({
			"left" : (x-2) + "px",
			"top" : (y-2) + "px"
		})
		.appendTo("body")
	var vdiv = $("<div class='votes'></div>").appendTo(div);
	var voteup = $("<a>&#9650;</a>").appendTo(vdiv);
	var votedown = $("<a>&#9660;</a>").appendTo(vdiv);
	div.append("<img src='icons/" + place.icon + "'/>")
		.append("<h1>" + place.name + "</h1>")
		.append("<h2>(" + place.category + ")</h2>");
	_placeinfo = div;
}

function removePlaceInfo() {
	if(_placeinfo) _placeinfo.remove();
}
