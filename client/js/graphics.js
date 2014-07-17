/*
 * graphics.js
 *
 * The most significant sourcefile in this project. It does all the fancy
 * drawing visual stuff and also handles the transformation of render to
 * real map coordinates.
 *
 * 2014 by Prior(Frederick Gnodtke) under the terms of GNU GPL
 */


var Graphics = function(canvas, overlay, config, mouse, folder) {
    var self = this;
    this.config = config; //Save configuration
    window.addEventListener('resize', function() { //On resize we have to resize our canvasareas
        self.resize();
    }, false);
    this.drawables = []; //All drawable interfaceelements
    this.places = []; //All places
    this.loading = 0; //Amount of currently loading tiles (images being downloaded)
    this.iconsize = 24; //Displaysize of icons, you may change this if you want bigger or smaller icons
    this.max_images_cached = 3000; //Maximum amount of tiles to be cached. Each tile is ~40kb. You could change this value to improve performance
    this.FPS = 60; //Fixing the framerate to a framerate different from 60 does not work
    this.canvas = canvas; //Canvas used for drawing the map itself
    this.overlay = overlay; //Overlaying canvas used for the interface
    this.ctx = this.canvas.getContext("2d"); //Context for map-canvas
    this.octx = this.overlay.getContext("2d"); //Context for overlay-canvas
    this.images = {}; //All currently cached tiles for the map
    this.icons = {}; //All cached icons
    this.drawstep = 0; //This is an everchanging number (increasing + modulus) that differenciates between the different frames rendered.
                       //usefull to determine if current drawing still belongs to current frame or is to old and should be aborted
    this.folder = folder; //Folder to look for tiles in
    this.factor = config.interval.end; //startfactor. The factor indicates the current level of zoom
    mouse.onDrag(function(offset) { //Bind draghandler to mouse and move the map respectivly
        if((self.offset.x + offset.x + self.config.width/self.factor >= self.canvas.width || offset.x > 0) && //Do not move the map out of the viewport
        (self.offset.x + offset.x <= 0 || offset.x < 0))
            self.offset.x += offset.x; //Change offset
        if((self.offset.y + offset.y + self.config.height/self.factor >= self.canvas.height || offset.y > 0) && //Do not move the map out of the viewport
            (self.offset.y + offset.y <= 0 || offset.y < 0))
            self.offset.y += offset.y; //Change offset
    });
    mouse.onWheel(function(delta) { //Zoom on mousewheel
        self.zoom(delta);
    });
    this.mouse = mouse; //Sabe pointer to mouse for later use
    this.resize(); //Initial resize of canvas
    while(this.config.width / this.factor < this.canvas.width) this.factor--; //Lower the factor until the map fills the whole screen on the x-axis
    this.offset = { //Initial offset set to the center of the map
        x : -(this.config.width/this.factor)/2 + canvas.width/2,
        y : -(this.config.height/this.factor)/2 + canvas.height/2
    };
    this.redraw(); //Start draw-loop and commit initial drawing
};

Graphics.prototype = {
    /*
     * Called on mousewheel, will zoom the map in or out
     * (delta may be a positive or negative number, depending on whether you want to
     * zoom in or zoom out)
     */
    zoom : function(delta){
        var oldfactor = this.factor; //Save old factor for later comparison
        this.factor -= delta; //Change current zoom
        if(this.factor < this.config.interval.start) this.factor = this.config.interval.start; //Do not leave defined range while zooming
        if(this.factor > this.config.interval.end) this.factor = this.config.interval.end;
        var mouseoffset_old = { //Calculate old offset in order to transform offset relative to mouse position
            x : (this.mouse.position.x - this.offset.x) * oldfactor,
            y : (this.mouse.position.y - this.offset.y) * oldfactor
        };
        this.offset = { //Calculate the new offset as if we would zoom to center
            x: (this.offset.x * oldfactor)/this.factor,
            y: (this.offset.y * oldfactor)/this.factor
        };
        var mouseoffset_new = {//Now calculate the new mouseoffset relative to the current offset (zoomed in to center)
            x : (this.mouse.position.x - this.offset.x) * this.factor,
            y : (this.mouse.position.y - this.offset.y) * this.factor
        };
        this.offset.x += (mouseoffset_new.x - mouseoffset_old.x)/this.factor; //Now change the current offset respectively
        this.offset.y += (mouseoffset_new.y - mouseoffset_old.y)/this.factor;
        this.forceRedraw(); //Force the map to be redrawn
    },
    /*
     * This method will resize the canvas to the current size of the window
     * Called from a handler each time the window was resized
     */
    resize : function() {
        this.canvas.width = window.innerWidth; //Set new dimensions on both canvas
        this.canvas.height = window.innerHeight;
        this.overlay.width = window.innerWidth;
        this.overlay.height = window.innerHeight;
        this.forceRedraw(); //Force a full redraw
    },
    /*
     * Will trigger a redraw on the next step in the renderloop
     */
    forceRedraw : function() {
        this.lastoffset = undefined; //Undefine lastoffset to force the renderloop to do a full redraw (including the map)
    },
    /*
     * Will redraw the whole map
     */
    drawMap : function() {
        var self = this;
        this.drawstep = (this.drawstep +1) % 10000; //Calculate new drawstep to make sure old images still loading will not draw themself
        for(var y = 0; y*this.factor < this.config.height; y += this.config.scale) { //Draw everything
            for(var x = 0; x*this.factor < this.config.width; x += this.config.scale) {
                var filename = this.folder + "/" + "zoom_" + this.factor + "/" + x*this.factor + "_" + y*this.factor + ".png"; //Calulate the tile that has to be loaded (it's filename)
                if(x + this.offset.x > this.canvas.width || //Check whether the tile is inside the viewable area
                    y + this.offset.y > this.canvas.height ||
                    x + this.offset.x + this.config.scale < 0 ||
                    y + this.offset.y + this.config.scale < 0) {
                    //If the tile is outside but is in the images-cache and we have more images loaded than allowed, unload this image
                    if(this.images[filename] !== undefined && this.images.length > this.max_images_cached) this.images[filename] = undefined;
                    //console.log(filename + " no longer needed, unloading");
                }
                else {
                    /*
                     * Will perform the drawing of one image at the specified position
                     */
                    function draw(img, x, y) {
                        self.ctx.drawImage(img, x + self.offset.x, y + self.offset.y); //Draw it on the canvas
                    }
                    if(this.images[filename] === undefined || !this.images[filename].complete) { //If the image is not loaded or not yet loaded
                        /*
                         * Draw loading rectangle
                         */
                        this.ctx.fillStyle = "white"; //For background
                        this.ctx.strokeStyle = "black"; //For border
                        this.ctx.beginPath(); //Now draw the rectangle
                        this.ctx.rect(x + this.offset.x + 1, y + this.offset.y + 1, this.config.scale - 2, this.config.scale - 2); //Draw rectangle where image should have been
                        this.ctx.fill(); //Fill it white
                        this.ctx.stroke(); //Stroke it black
                        this.ctx.fillStyle = "#888"; //Textcolor
                        this.ctx.textAlign = "center"; //center it in the rectangle
                        this.ctx.font = "italic 12px Verdana";
                        this.ctx.fillText("Loading...", x + this.offset.x + this.config.scale / 2, this.offset.y + y + this.config.scale /2 + 6); //Draw the text
                        if(this.images[filename] === undefined) { //If image is not yet loaded we need to cache it
                            (function(x, y, mystep, filename) { //Scope out of loop
                                //console.log("Needing " + filename + ", loading");
                                var img = new Image(); //Create new imageresource to store image in
                                self.loading ++; //Increase amount of currently loading images
                                img.onload = function() { //If loading is done, draw it and decrease counter
                                    //console.log(images);
                                    if(self.drawstep == mystep) draw(img, x, y); //Draw it if we are still in the correct drawstep
                                    self.loading --; //No longer loading, decrease counter
                                    console.log("Loading Images: " + self.loading);
                                    if(self.loading == 0) {
                                        self.completedLoading(); //If no more images are loading, cast completedLoading() event (draw places)
                                    }
                                };
                                self.images[filename] = img; //Save the image
                                img.src = filename; //Set the filename and kick off loading
                            })(x, y, self.drawstep, filename);
                        }
                        else { //The image is cached but still actively loading but the drawstep has changed in the meantime
                            (function(x, y, mystep, filename) { //Change what will be done when the image has finished loading
                                self.images[filename].onload = function() {
                                    if(self.drawstep == mystep) draw(self.images[filename], x, y); //Update coordinates
                                    self.loading --;
                                    console.log("Loading Images: " + self.loading);
                                    if(self.loading == 0) {
                                        self.completedLoading();
                                    }
                                };
                            })(x, y, self.drawstep, filename); //Update coordinates and step
                        }
                    }
                    else { //The image is just fully loaded, nothing special has to be done, just draw it
                        //console.log("No need to reload:" + filename);
                        var img = this.images[filename]; //grab pointer
                        draw(img, x, y); //draw it, yay :)
                    }
                }
            }
        }
    },
    /*
     * Draw all drawables (interface elements)
     */
    drawDrawables : function() {
        for(var i in this.drawables) { //Iterate over all interface elements
            var d = this.drawables[i];
            var rect = d.getRect(); //Each one will supply its current rectangle it is occupying with this method
            this.octx.clearRect(rect.x, rect.y, rect.width, rect.height); //Clear the respective old rectangle
            d.draw(this); //redraw it
        }
    },
    /*
     * Will register a new interface element to be drawn
     */
    addDrawable : function(drawable) {
        this.drawables.push(drawable);
    },
    /*
     * Will register a new place to be drawn
     */
    addPlace : function(place) {
        this.places.push(place);
    },
    /*
     * Will transform real coordinates (0 .. map-width/0 .. map-height) to
     * actual render-coordinates (depending on offset etc)
     */
    transformRealToRenderCoordinates : function(x, y) {
        return {
            x : x/this.factor + this.offset.x,
            y : y/this.factor + this.offset.y
        };
    },
    /*
     * Will transform render coordinates (coordinates on screen) back to
     * real coordinates on the map
     */
    transformRenderToRealCoordinates : function(x, y) {
        return {
            x : x*this.factor - this.offset.x*this.factor,
            y : y*this.factor - this.offset.y*this.factor
        };
    },

    /*
     * Will draw all registered places
     */
    drawPlaces : function() {
        var self = this;
        for(var i in this.places) { //Iterate over all places
            (function(place) { //Scope out!
                if(place.x/self.factor - self.iconsize/2 + self.offset.x < self.canvas.width &&  //Check whether the place is in the actual
                    place.x/self.factor + self.iconsize/2 + self.offset.x > 0 &&                 //Drawable area
                    place.y/self.factor - self.iconsize/2 + self.offset.y < self.canvas.width &&
                    place.y/self.factor + self.iconsize/2 + self.offset.y > 0)if(true) {
                    var icon; //The icon to be drawn
                    /*
                     * Will draw the place with its icon and text
                     */
                    function draw(img, coord) {
                        if(place.score < 0) self.ctx.globalAlpha = 0.5;
                        self.ctx.drawImage(img, //First, draw the icon
                            coord.x - self.iconsize/2,
                            coord.y - self.iconsize/2,
                            self.iconsize, self.iconsize
                        );
                        self.ctx.textAlign = "center"; //center text over icon
                        self.ctx.font = "15px Verdana"; //bigger font
                        self.ctx.strokeStyle = "black;" //black border for improved visibility
                        self.ctx.fillStyle = "white"; //White fontcolor
                        self.ctx.strokeText(place.name, coord.x, coord.y - self.iconsize/2 - 5 - 14); //Draw the name
                        self.ctx.fillText(place.name, coord.x, coord.y - self.iconsize/2 - 5 - 14);
                        self.ctx.font = "11px Verdana"; //Smaller font
                        self.ctx.strokeText(place.category, coord.x, coord.y - self.iconsize/2 - 5); //Draw the category
                        self.ctx.fillText(place.category, coord.x, coord.y - self.iconsize/2 - 5);
                        if(place.score < 0) self.ctx.globalAlpha = 1;
                    }
                    var coord = self.transformRealToRenderCoordinates(place.x, place.y); //Get rendercoordinates
                    if(icon = self.icons[place.icon]) { //If icon already cached, nothing to be done, just draw the damn thing
                        draw(icon, coord); //Draw :)
                    }
                    else { //Image unknown, needs to be cached
                        //TODO: ICONS WILL BE LOADED MULTIPLE TIMES IF MORE THAN ONE PLACE WITH THE SAME ICON VISIBLE!! FIX THIS!!
                        var img = new Image(); //Save image
                        img.onload = function() { //If done loading, draw me :)
                            draw(this, coord);
                        };
                        img.src = "icons/" + place.icon; //Kickoff loading
                        self.icons[place.icon] = img; //save pointer to image
                    }
                }
            })(this.places[i]);
        }
    },
    /*
     * Called, when all tiles of the map have completed loading.
     * We need to redraw the places now, as the tiles may have overwritten them
     */
    completedLoading : function() {
        this.drawPlaces();
    },

    /*
     * The main render loop. Calls itself recusivley using window.requestAnimationFrame
     */
    redraw : function() {
        var self = this;
        window.requestAnimationFrame(function() { //Nag the window to perform new animationframe
            self.tickTime = Date.now() - self.lastFrame; //For performance measurement
            //console.log(1000/self.tickTime+"<"+self.FPS);
            if(self.lastFrame == undefined || 1000/self.tickTime < self.FPS) { //Do not exceed a certain rate of FPS
                //console.log("Render");
                self.lastFrame = Date.now(); //For performance measurement
                /*
                 * Do only redraw the map if we changed the offset. Else nothing has changed and so we can skip the rendering,
                 * Save us some performance and just leave the damn thing there
                 */
                if(self.lastoffset === undefined || self.lastoffset.x != self.offset.x || self.lastoffset.y != self.offset.y) {
                    self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height); //Clear canvas fully
                    self.drawMap(); //Redraw map (just trigger, this is partially async)
                    self.drawPlaces(); //Redraw the places (just trigger, this is partially async)
                }
                self.drawDrawables(); //the interface has to be redrawn every damn tick (because of cursor and such)
                self.lastoffset = { //Save last offset to see if it has changed and the map has to be redrawn. Will be set to unedfined on forceRedraw()
                    x : self.offset.x,
                    y : self.offset.y
                };
            }
            self.redraw(); //recurse
        });
    }
};

/*
 * A little helper function mainly used by the cursor
 * Don't ask me why I defined it here, I don't know either
 * But i guess it did some sort of sense back then
 * and I don't want to question myself so it will stay here :)
 *
 * Oh, by the way this method will transform degree into radiant
 */
function degToRad(degree) {
    return (2*Math.PI)/360 * degree;
}
