/*
 * index.js.js
 *
 * This source handles the displaying of the index at startup to give the user
 * the possibility to select a map.
 *
 * 2014 by Prior(Frederick Gnodtke) under the terms of GNU GPL
 */

function Index(ul) {
	$.ajax({
		url : "index.json",
		success : function(obj) {
			for(var i in obj) {
				(function(map) {
					var link = $("<a href='#'>" + map.name + "</a>").click(function(e) {
						ShowMap(map.folder);
						e.preventDefault();
					}).appendTo($("<li></li>").appendTo(ul));
				})(obj[i]);
			}
		}
	});
}
