Connection = {
	loginHandlers : [],
	init : function() {
		var self = this;
		Websocket.addOpenListener(function() {
			if(localStorage.identity) {
				self.checkCookie();
			}
			else {
				self.acquireCookie();
			}
		});
	},
	addLoginDoneHandler : function(method) {
		this.loginHandlers.push(method);
	},

	getCategories : function(callback) {
		Websocket.send("getCategories", {}, function(response) {
			callback(response);
		});
	},

	getPlaces : function(map, callback) {
		Websocket.send("getPlaces", {
			map :map
		}, function(places) {
			callback(places);
		});
	},

	submitPlace : function(x, y, id, name, description, map, callback) {
		var self = this;
		Websocket.send("addPlace", {
			x : x,
			y : y,
			category : id,
			name : name,
			description : description,
			map : map
		}, function(success) {
			if(!success) alert("Something went wrong");
			callback();
		})
	},

	checkCookie : function() {
		var self = this;
		Websocket.send("checkCookie", {
			cookie : localStorage.identity
		}, function(answer) {
			if(answer.success) {
				self.identity = answer.cookie;
				localStorage.identity = answer.cookie;
				for(var i in self.loginHandlers) self.loginHandlers[i]();
			}
			else {
				self.acquireCookie();
			}
		});
	},

	acquireCookie : function() {
		var self = this;
		Websocket.send("acquireCookie", {}, function(answer) {
			self.identity = answer.cookie;
			localStorage.identity = answer.cookie;
			for(var i in self.loginHandlers) self.loginHandlers[i]();
		});
	}
};
