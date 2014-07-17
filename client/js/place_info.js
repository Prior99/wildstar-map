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
	var wrapper = $("<div class='wrapper'></div>").appendTo(div);
	var scorediv = $("<div class='score'></div>").appendTo(wrapper);
	var vdiv = $("<div class='votes'></div>").appendTo(wrapper);
	_placeinfo = div;
	Websocket.send("getVote", {
		placeid : place.id
	},function(obj) {
		Websocket.send("getVoteScore", {
			placeid : place.id
		}, function(obj) {
			var score = 0;
			function updateScore(s) {
				if(s == undefined) s = 0;
				score = s;
				scorediv.html(score);
			}
			function vote(diff) {
				Websocket.send("vote", {
					placeid : place.id,
					value : diff
				}, function(obj) {
					updateScore(obj.score);
					votedown.removeClass("selected");
					voteup.removeClass("selected");
					if(diff == -1) votedown.addClass("selected");
					if(diff == 1) voteup.addClass("selected");
				});
			}
			var voteup = $("<a>&#9650;</a>").appendTo(vdiv).click(function() {
				if(voteup.hasClass("selected")) {
					vote(0);
				}
				else vote(1);
			});
			var votedown = $("<a>&#9660;</a>").appendTo(vdiv).click(function() {
				if(votedown.hasClass("selected")) {
					vote(0);
				}
				else vote(-1);
			});
			if(obj.score) {
				if(obj.score == -1) {
					votedown.addClass("selected");
				}
				if(obj.score == 1) {
					voteup.addClass("selected");
				}
			}
			updateScore(obj.score);
		});
	});
	var description = place.description.length == 0 ? "No description given." : place.description;
	div.append("<img src='icons/" + place.icon + "'/>")
	div.append("<h1>" + place.name + "</h1>")
	div.append("<h2>" + place.category + "</h2>");
	div.append($("<div class='description'>" + description + "</div>"));

}

function removePlaceInfo() {
	if(_placeinfo) _placeinfo.remove();
}
