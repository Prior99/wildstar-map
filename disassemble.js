var Canvas = require("canvas");
var Image = Canvas.Image;
var FS = require("fs");

var scale = 128;
var maxStep = 12;
var step = 1;
var canvas, ctx;
var canvas2, ctx2;

function scaleImage(obj) {
    scale = obj.scale == undefined ? 128 : obj.scale;
    maxStep = obj.maxStep == undefined ? 12 : obj.maxStep;
    step = obj.startStep == undefined ? 1 : obj.startStep;

    FS.readFile(obj.file, function(err, data) {
        var img = new Image();
        img.src = data;
        initCanvas(img.width, img.height);
        ctx.drawImage(img, 0 ,0);
        console.log(" ...Done.");
        function done() {
            if(step < maxStep) {
                step++;
                scaleDown(done);
            }
        }
        scaleDown(done);
    });
}


function initCanvas(width, height) {
    canvas = new Canvas(width, height);
    ctx = canvas.getContext("2d");
    canvas2 = new Canvas(scale, scale);
    ctx2 = canvas2.getContext("2d");
}

function scaleDown(done) {

    canvas3 = new Canvas(scale*step, scale*step);
    ctx3 = canvas3.getContext("2d");

    console.log("Scaling down to factor " + step + "*" + scale + "...");
    var dirname = "zoom_" + step;
    var x = 0, y = 0;
    function iterate() {
        var imgData = ctx.getImageData(x, y, scale*step, scale*step);
        ctx3.putImageData(imgData, 0, 0);
        ctx2.drawImage(canvas3, 0, 0, scale, scale);
        var out = FS.createWriteStream(dirname + "/" + x + "_" + y + ".png");
        canvas2.pngStream().on("data", function(chunk) {
            out.write(chunk);
        }).on("end", function() {
            out.end();
        });
        out.on("finish", function() {
            x+=scale*step;
            if(x >= canvas.width) {
                x = 0;
                y+=scale*step;
                if(y >= canvas.height) {
                    console.log(" ...Done.");
                    done();
                    return;
                }
            }
            iterate();
        });
    }
    FS.mkdir(dirname, function(err) {
        iterate();
    });
}

module.exports = scaleImage;
