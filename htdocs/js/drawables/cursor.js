function Cursor(mouse, conf) {
    this.mouse = mouse;
    this.phi = 0;
    this.position = {
        x : mouse.position.x,
        y : mouse.position.y
    };
    this.radius = 10;
};

Cursor.prototype = {
    draw : function(g) {
        this.position.x = this.mouse.position.x;
        this.position.y = this.mouse.position.y;
        var gap = degToRad(40);
        g.octx.strokeStyle = "white";
		g.octx.lineWidth = 2;
		for(var i = -1; i <= 7; i+=2) {
			g.octx.beginPath();
			g.octx.arc(this.position.x, this.position.y, this.radius, i*Math.PI/4 + gap/2 + this.phi, (i+2)*Math.PI/4 - gap/2 + this.phi);
			g.octx.stroke();
		}
		this.phi += degToRad(2);
    },
    getRect : function() {
        return {
            x : this.position.x - 12,
            y : this.position.y - 12,
            width : 24,
            height : 24
        };
    }
};
