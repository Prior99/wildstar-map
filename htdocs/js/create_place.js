function createPlace(x, y, map) {
	var div = $("<div class='dialog'></div>")
		.appendTo($("<div class='dialogwrapper'></div>").appendTo("body"));
	div.append("<h1>Create New Place</h1>");
	Connection.getCategories(function(categories) {
		var table = $("<table></table>").appendTo(div);
		var select = $("<select size='1'></select>")
			.appendTo($("<td></td>")
				.appendTo($("<tr></tr>")
					.append("<td>Category</td>")
					.appendTo(table)));
		for(var i in categories) {
			var cat = categories[i];
			console.log(cat);
			select.append($("<option value='" + cat.id + "'>" + cat.name + "</option>"));
		}
		var name = $("<input type='text' />")
			.appendTo($("<td></td>")
				.appendTo($("<tr></tr>")
					.append("<td>Name</td>")
					.appendTo(table)));
		var desc = $("<textarea></textarea>")
			.appendTo($("<td></td>")
				.appendTo($("<tr></tr>")
					.append("<td>Description</td>")
					.appendTo(table)));
		$("<button>Okay</button>")
			.appendTo($("<td></td>")
				.appendTo($("<tr></tr>")
					.append("<td>Submit</td>")
					.appendTo(table)))
			.click(function() {
				Connection.submitPlace(x, y, select.val(), name.val(), desc.val(), map, function() {
					div.remove();
				});
			});
	});
}
