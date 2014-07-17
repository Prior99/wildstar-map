/*
 * drawables/fps.js
 *
 * Will draw an beautiful and informative fps-widget on the overlay.
 *
 * 2014 by Prior(Frederick Gnodtke) under the terms of GNU GPL
 */

function FPS(graphics, pos) {
	this.graphics = graphics;
	this.pos = pos;
};

FPS.prototype = {
	draw : function(g) {
		g.octx.fillStyle = "white";
		g.octx.textAlign = "left";
		g.octx.font = "16px Verdana";
		var fps = Math.floor(1000/this.graphics.tickTime);
		g.octx.fillText("FPS: " + fps, this.pos.x, this.pos.y + 16);
		g.octx.fillText("TT: " + this.graphics.tickTime + "ms", this.pos.x, this.pos.y + 20 + 16);
	},

	getRect : function() {
		return {
			x : this.pos.x - 2,
			y : this.pos.y - 2,
			width : 400,
			height : 40
		};
	}
};
