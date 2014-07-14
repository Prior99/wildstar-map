/*
 * Imports
 */
var Canvas = require("canvas");
var Image = Canvas.Image;
var FS = require("fs");


var xmin, xmax, ymin, ymax, scale, folder, output;
var canvas, ctx;
var x, y;
var onFinish;

function lez(num) {
    if(num.length < 2) num = "0"+num;
    return num;
}

function recurse() {
    FS.readFile(folder + "/" + lez(y.toString(16)) + lez(x.toString(16)) + ".png", function(err, content) {
        if(!err) {
            var img = new Image();
            img.src = content;
            ctx.drawImage(img, (x-xmin)*scale, (y-ymin)*scale, scale, scale);
        }
        else {
            ctx.fillStyle = "#2f76bb";
            ctx.fillRect((x-xmin)*scale, (y-ymin)*scale, scale, scale);
        }
        x++;
        if(x >= xmax) {
            x = 0;
            y++
            process.stdout.write("Assembling large image... " + Math.floor(((y-ymin)/(ymax-ymin))*100) + "%\r");
        }
        if(y < ymax) {
            recurse();
        }
        else {
            finish();
        }
    });
}

function finish() {
    var overall = 0;
    console.log("Assembling large image... Done.");
    process.stdout.write("Writing image to disk... \r");
    var out = FS.createWriteStream(output);
    canvas.pngStream().on("data", function(chunk) {
        out.write(chunk);
        overall += chunk.length;
        process.stdout.write("Writing image to disk... " + Math.floor(overall/(1024*1024)) + "MB\r");
    }).on("end", function() {
        console.log("Writing image to disk... Done.");
        if(onFinish !== undefined) onFinish();
    });
}

module.exports = function(obj) {
    xmin = obj.span.x.min;
    xmax = obj.span.x.max;
    ymin = obj.span.y.min;
    ymax = obj.span.y.max;
    scale = obj.scale;
    folder = obj.folder;
    output = obj.output;
    onfinish = obj.finish;
    x = xmin;
    y = ymin;
    console.log("Tiles: " + (xmax - xmin) + "x" +  (ymax - ymin));
    console.log("Pixels: " + (xmax - xmin)*scale + "x" +  (ymax - ymin)*scale);
    canvas = new Canvas((xmax - xmin)*scale, (ymax - ymin)*scale);
    ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";
    recurse();
};
