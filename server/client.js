var WebSocket = require("./websocket_server.js");

function Client(ws, databasePool) {
    var self = this;
    this.ws = ws;
    this.socket = new WebSocket(ws);
    this.addAcquireCookieListener();
    this.addCheckCookieListener();
    this.addGetCategoriesListener();
    this.db = databasePool;
    this.identity = undefined;
};

Client.prototype = {
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
