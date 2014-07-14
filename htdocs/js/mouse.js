var Mouse = function(canvas) {
    var self = this;
    this.position = {
        x : 0,
        y : 0
    };
    canvas.addEventListener("mouseup", function(e) {
        self.up(e);
    });
    canvas.addEventListener("mousedown", function(e) {
        self.down(e);
    });
    canvas.addEventListener("mousemove", function(e) {
        self.move(e);
    });
    canvas.addEventListener("mousewheel", function(e) {
        self.wheel(e);
    }, false);
    canvas.addEventListener("DOMMouseScroll", function(e) {
        self.wheel(e);
    }, false);
    this.dragEvents = [];
    this.upEvents = [];
    this.downEvents = [];
    this.wheelEvents = [];
    this.last = undefined;
};

Mouse.prototype = {
    onDrag : function(f) {
        this.dragEvents.push(f);
    },
    onUp : function(f) {
        this.upEvents.push(f);
    },
    onDown : function(f) {
        this.downEvents.push(f);
    },
    onWheel : function(f) {
        this.wheelEvents.push(f);
    },
    up : function() {
        this.pressed = false;
        this.last = undefined;
        for(var i in this.upEvents) {
            this.upEvents[i]();
        }
    },
    down : function() {
        this.pressed = true;
        this.last = undefined;
        for(var i in this.downEvents) {
            this.downEvents[i]();
        }
    },
    move : function(e) {
        this.position.x = e.x;
        this.position.y = e.y;
        if(this.pressed) {
            if(this.last != undefined) {
                /*offset = {
                    x : offset.x + e.x - last.x,
                    y : offset.y + e.y - last.y
                };*/
                var offset = {
                    x : e.x - this.last.x,
                    y : e.y - this.last.y
                }
                for(var i in this.dragEvents) {
                    this.dragEvents[i](offset);
                }
            }
            this.last = {
                x : e.x,
                y : e.y
            };
        }
    },
    wheel : function(e) {
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        for(var i in this.wheelEvents) {
            this.wheelEvents[i](delta);
        }
    }
};
