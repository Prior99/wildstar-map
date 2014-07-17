var Canvas = require("canvas");
var Image = Canvas.Image;
var FS = require("fs");

var scale, maxStep, step, folder, firstStep;
var canvas, ctx;
var canvas2, ctx2;
var finish;

function scaleImage(obj) {
    scale = obj.scale == undefined ? 128 : obj.scale;
    maxStep = obj.maxStep == undefined ? 12 : obj.maxStep;
    step = obj.startStep == undefined ? 1 : obj.startStep;
    firstStep = step;
    finish = obj.finish;
    folder = obj.folder;
    process.stdout.write("Reading in file... \r");
    FS.readFile(obj.file, function(err, data) {
        var img = new Image();
        img.src = data;
        initCanvas(img.width, img.height);
        ctx.drawImage(img, 0 ,0);
        function done() {
            if(step < maxStep) {
                step++;
                scaleDown(done);
            }
            else {
                FS.writeFile(folder + "/" + "descriptor.json", JSON.stringify({
                    scale : scale,
                    interval : {
                        start : firstStep,
                        end : maxStep
                    },
                    width : img.width,
                    height : img.height
                }), function(err) {
                    if(err) throw err;
                    if(finish !== undefined) finish();
                });
            }
        }
        console.log("Reading in file... Done.");
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
    var dirname = folder + "/" + "zoom_" + step;
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
                process.stdout.write("Disassembling large image, scale 1:" + step + "... " + Math.floor((y/canvas.height)*100) + "%\r");
                if(y >= canvas.height) {
                    console.log("Disassembling large image, scale 1:" + step + "... Done.");
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
