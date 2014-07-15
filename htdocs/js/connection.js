function Connection() {
    var self = this;
    Websocket.addOpenListener(function() {
        Websocket.send("acquireCookie", {}, function(answer) {
            console.log(answer);
        });
    });
};

Connection.prototype = {

};
