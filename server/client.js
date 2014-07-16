var WebSocket = require("./websocket_server.js");

function Client(ws, databasePool) {
	var self = this;
	this.ws = ws;
	this.socket = new WebSocket(ws);
	this.addAcquireCookieListener();
	this.addCheckCookieListener();
	this.addGetCategoriesListener();
	this.addAddPlaceListener();
	this.addGetPlacesListener();
	this.db = databasePool;
	this.identity = undefined;
};

Client.prototype = {
	addGetPlacesListener : function() {
		var self = this;
		this.socket.addListener('getPlaces', function(obj, answer) {
			self.db.getPlaces(obj.map, function(err, places) {
				console.log(places);
				answer(places);
			})
		}, true);
	},
	addAddPlaceListener : function() {
		var self = this;
		this.socket.addListener('addPlace', function(obj, answer) {
			self.db.addPlace(obj.x, obj.y, obj.name, obj.description, obj.category, self.identity.id, obj.map, function(err) {
				answer({
					success : !err
				});
			});
		}, true);
	},
	addGetCategoriesListener : function() {
		var self = this;
		this.socket.addListener('getCategories', function(obj, answer) {
			self.db.getCategories(function(err, categories) {
				if(!err) answer(categories);
			});
		}, true);
	},
	addAcquireCookieListener : function() {
		var self = this;
		this.socket.addListener('acquireCookie', function(obj, answer) {
			self.acquireCookie(function(success) {
				if(success) {
					answer({
						success : true,
						cookie : self.identity.cookie
					});
				}
				else {
					answer({
						success: false
					});
				}
			});
		}, true);
	},
	addCheckCookieListener : function() {
		var self = this;
		this.socket.addListener('checkCookie', function(obj, answer) {
			self.checkCookie(obj.cookie, function(success) {
				if(success) {
					answer({
						success : true,
						cookie : self.identity.cookie
					});
				}
				else {
					answer({
						success: false
					});
				}
			});
		}, true);
	},
	checkCookie : function(cookie, callback) {
		var self = this;
		this.db.getUserID(cookie, function(err, id) {
			if(!err) {
				self.identity = {
					cookie : cookie,
					id : id
				};
				callback(true);
			}
			else {
				callback(false);
			}

		})
	},
	acquireCookie : function(callback) {
		var self = this;
		this.db.addUser(this.ws._socket.remoteAddress, function(err, cookie, id) {
			if(!err) {
				self.identity = {
					cookie : cookie,
					id : id
				};
				callback(true);
			}
			else {
				callback(false);
			}
		});
	}
};

module.exports = Client;
