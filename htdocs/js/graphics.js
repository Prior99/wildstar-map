var Graphics = function(canvas, config, mouse, folder) {
    var self = this;
    this.config = config;
    window.addEventListener('resize', function() {
        self.resize();
    }, false);
    this.loading = 0;
    this.max_images_cached = 1000;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.images = {};
    this.drawstep = 0;
    this.folder = folder;
    this.factor = config.interval.end;
    mouse.onDrag(function(offset) {
        if((self.offset.x + offset.x + self.config.width/self.factor >= self.canvas.width || offset.x > 0) &&
        (self.offset.x + offset.x <= 0 || offset.x < 0))
            self.offset.x += offset.x;
        if((self.offset.y + offset.y + self.config.height/self.factor >= self.canvas.height || offset.y > 0) &&
            (self.offset.y + offset.y <= 0 || offset.y < 0))
            self.offset.y += offset.y;
    });
    mouse.onWheel(function(delta) {
        self.zoom(delta);
    });
    this.mouse = mouse;
    this.resize();
    while(this.config.width / this.factor < this.canvas.width) this.factor--;
    this.offset = {
        x : -(this.config.width/this.factor)/2 + canvas.width/2,
        y : -(this.config.height/this.factor)/2 + canvas.height/2
    };
    this.redraw();
};

Graphics.prototype = {
    zoom : function(delta){
        var oldfactor = this.factor;
        this.factor -= delta;
        if(this.factor < this.config.interval.start) this.factor = this.config.interval.start;
        if(this.factor > this.config.interval.end) this.factor = this.config.interval.end;
        var mouseoffset_old = {
            x : (this.mouse.position.x - this.offset.x) * oldfactor,
            y : (this.mouse.position.y - this.offset.y) * oldfactor
        };
        this.offset = {
            x: (this.offset.x * oldfactor)/this.factor,
            y: (this.offset.y * oldfactor)/this.factor
        };
        var mouseoffset_new = {
            x : (this.mouse.position.x - this.offset.x) * this.factor,
            y : (this.mouse.position.y - this.offset.y) * this.factor
        };
        this.offset.x += (mouseoffset_new.x - mouseoffset_old.x)/this.factor;
        this.offset.y += (mouseoffset_new.y - mouseoffset_old.y)/this.factor;
        this.forceRedraw();
    },
    resize : function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.forceRedraw();
    },
    forceRedraw : function() {
        this.lastoffset = undefined;
        this.redraw();
    },
    drawMap : function() {
        var self = this;
        this.drawstep = (this.drawstep +1) % 10000;
        for(var y = 0; y*this.factor < this.config.height; y += this.config.scale) {
            for(var x = 0; x*this.factor < this.config.width; x += this.config.scale) {
                var filename = this.folder + "/" + "zoom_" + this.factor + "/" + x*this.factor + "_" + y*this.factor + ".png";
                if(x + this.offset.x > this.canvas.width ||
                    y + this.offset.y > this.canvas.height ||
                    x + this.offset.x + this.config.scale < 0 ||
                    y + this.offset.y + this.config.scale < 0) {
                    if(this.images[filename] !== undefined && this.images.length > this.max_images_cached) this.images[filename] = undefined;
                    //console.log(filename + " no longer needed, unloading");
                }
                else {
                    function draw(img, x, y) {
                        self.ctx.drawImage(img, x + self.offset.x, y + self.offset.y);
                    }
                    if(this.images[filename] === undefined || !this.images[filename].complete) {
                        this.ctx.fillStyle = "white";
                        this.ctx.strokeStyle = "black";
                        this.ctx.beginPath();
                        this.ctx.rect(x + this.offset.x + 1, y + this.offset.y + 1, this.config.scale - 2, this.config.scale - 2);
                        this.ctx.fill();
                        this.ctx.stroke();
                        this.ctx.fillStyle = "#888";
                        this.ctx.textAlign = "center";
                        this.ctx.font = "italic 12px Verdana";
                        this.ctx.fillText("Loading...", x + this.offset.x + this.config.scale / 2, this.offset.y + y + this.config.scale /2 + 6);
                        if(this.images[filename] === undefined) {
                            (function(x, y, mystep, filename) {
                                //console.log("Needing " + filename + ", loading");
                                var img = new Image();
                                self.loading ++;
                                img.onload = function() {
                                    //console.log(images);
                                    if(self.drawstep == mystep) draw(img, x, y);
                                    self.loading --;
                                };
                                self.images[filename] = img;
                                img.src = filename;
                            })(x, y, self.drawstep, filename);
                        }
                        else {
                            (function(x, y, mystep, filename) {
                                self.images[filename].onload = function() {
                                    if(self.drawstep == mystep) draw(self.images[filename], x, y);
                                    self.loading --;
                                };
                            })(x, y, self.drawstep, filename);
                        }
                    }
                    else {
                        //console.log("No need to reload:" + filename);
                        var img = this.images[filename];
                        draw(img, x, y);
                    }
                }
            }
        }
    },
    redraw : function() {
        var self = this;
        window.requestAnimationFrame(function() {
            if(self.lastoffset === undefined || self.lastoffset.x != self.offset.x || self.lastoffset.y != self.offset.y) {
                self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
                self.drawMap();
                self.redraw();
            }
            else {
                self.redraw();
            }
            self.lastoffset = {
                x : self.offset.x,
                y : self.offset.y
            }
        });
    }
};
