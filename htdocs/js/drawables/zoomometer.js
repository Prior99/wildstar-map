function Zoomometer(graphics, pos) {
    this.graphics = graphics
    this.height = 250;
    this.width = 20;
    this.offset = {
        x : pos.x,
        y : pos.y
    };
};

Zoomometer.prototype = {
    draw : function(g) {
        var padding = 2;
        var lineWidth = 10;
        g.octx.lineWidth = 2;
        g.octx.strokeStyle = "white";
        g.octx.strokeRect(this.offset.x, this.offset.y, this.width, this.height);
        var lower = this.graphics.config.interval.start;
        var upper = this.graphics.config.interval.end;
        var amount = upper - lower;
        var iheight = this.height / amount;
        for(var i = lower; i <= upper; i++) {
            g.octx.beginPath();
            var y = this.offset.y + this.height - iheight * (i - lower);
            g.octx.moveTo(this.offset.x + this.width, y);
            g.octx.lineTo(this.offset.x + this.width + lineWidth, y);
            g.octx.stroke();
            g.octx.textAlign = "left";
            g.octx.font = "bold 14px Verdana";
            g.octx.fillText(i, this.offset.x + this.width + lineWidth + 10, y + 5);
        }
        var rel = (amount - (g.factor - lower)) / amount;
        g.octx.fillRect(this.offset.x + g.ctx.lineWidth + padding,
            this.offset.y + this.height - padding,
            this.width - 2* padding - 2* g.ctx.lineWidth,
            -rel*(this.height - padding*2 - g.ctx.lineWidth * 2));
    },

    getRect : function() {
        return {
            x : this.offset.x,
            y : this.offset.y - 5,
            width : this.width + 30,
            height : this.height + 10
        };
    }

}
