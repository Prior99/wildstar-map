function Context(mouse) {
    var self = this;
    mouse.onContext(function(x, y) {
        self.show(x, y);
    });
    mouse.onDown(function() {
        self.hide();
    });
    this.entries = [];
};

Context.prototype = {
    addEntry : function(name, func) {
        this.entries.push({
            name : name,
            func : func
        });
    },
    show : function(x, y) {
        this.position = {
            x: x,
            y: y
        };
        var self = this;
        this.hide();
        this.div = $("<div class='context'>").appendTo("body").css({
            left : x + "px",
            top : y + "px"
        });
        for(var i in this.entries) {
            (function(entry) {
                self.div.append($("<a>" + entry.name + "</a>").click(function() {
                    self.hide();
                    entry.func();
                }));
            })(this.entries[i]);
        }
    },
    hide : function() {
        this.position = undefined;
        if(this.div !== undefined) this.div.remove();
            this.div = undefined;
    }
};
