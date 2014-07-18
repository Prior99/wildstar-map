/*
 * create_place.js
 *
 * Supplies the code to create a dialog to create new places.
 *
 * 2014 by Prior(Frederick Gnodtke) under the terms of GNU GPL
 */

function createPlace(x, y, map) {
	var div = $("<div class='dialog'></div>")
		.appendTo($("<div class='dialogwrapper'></div>").appendTo("body"));
	div.append("<h1>Create New Place</h1>");
	Connection.getCategories(function(categories) {
		var table = $("<table></table>").appendTo(div);
		var select = $("<td></td>")
				.appendTo($("<tr style='height: 50px;'></tr>")
					.append("<td>Category</td>")
					.appendTo(table));
		var selected = undefined;
		var selectedID = undefined;
		var name = $("<input type='text' />")
			.appendTo($("<td></td>")
				.appendTo($("<tr></tr>")
					.append("<td>Name</td>")
					.appendTo(table)))
			.keyup(function() {
				checkOkay();
			});
		var desc = $("<textarea></textarea>")
			.appendTo($("<td></td>")
				.appendTo($("<tr></tr>")
					.append("<td>Description</td>")
					.appendTo(table)));
		var button = $("<button>Okay</button>")
			.appendTo($("<td></td>")
				.appendTo($("<tr></tr>")
					.append("<td>Submit</td>")
					.appendTo(table)))
			.click(function() {
				Connection.submitPlace(x, y, selectedID, name.val(), desc.val(), map, function() {
					div.remove();
				});
			}).attr("disabled", "disabled");
		function checkOkay() {
		if(selectedID /*&& name.val().length > 2*/) {
				button.removeAttr("disabled");
			}
			else {
				button.attr("disabled", "disabled");
			}
		}
		for(var i in categories) {
			var cat = categories[i];
			console.log(cat);
			var d = $("<div class='select'>" + cat.name + "</div>").appendTo(select);
			d.prepend("<img width='24' height='24' src='img/" + cat.icon + "' />");
			(function(d, id) {
				d.click(function(){
					if(selected) selected.removeClass("selected");
					selected = d;
					selected.addClass("selected");
					selectedID = id;
					checkOkay();
				});
			})(d, cat.id);
		}
	});
	return div;
}
