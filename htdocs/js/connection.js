function Connection() {
    var self = this;
    Websocket.addOpenListener(function() {
        if(localStorage.identity) {
            self.checkCookie();
        }
        else {
            self.acquireCookie();
        }
    });
    this.loginHandlers = [];
};

Connection.prototype = {
    addLoginDoneHandler : function(method) {
        this.loginHandlers.push(method);
    },

    checkCookie : function() {
        var self = this;
        Websocket.send("checkCookie", {
            cookie : localStorage.identity
        }, function(answer) {
            if(answer.success) {
                self.identity = answer.cookie;
                localStorage.identity = answer.cookie;
                for(var i in self.loginHandlers) self.loginhandlers[i]();
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
            for(var i in self.loginHandlers) self.loginhandlers[i]();
        });
    }
};
