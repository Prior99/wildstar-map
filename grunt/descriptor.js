var FS = require("fs");
var MySQL = require("mysql");

module.exports = {
	addToIndex : function(folder, name, done) {
		FS.readFile("htdocs/index.json", function(err, data) {
			var obj;
			if(err) obj = [];
			else obj = JSON.parse(data);
			var arr = [];
			for(var i in obj) {
				if(obj[i].folder != folder) arr.push(obj[i]);
			}
			arr.push({
				folder : folder,
				name : name
			});
			FS.writeFile("htdocs/index.json", JSON.stringify(arr), function() {
				done();
			});
		});
	}
}
