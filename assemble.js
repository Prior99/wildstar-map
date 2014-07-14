/*
 * Imports
 */
var Canvas = require("canvas");
var Image = Canvas.Image;
var FS = require("fs");
function lez(num) {
    if(num.length < 2) num = "0"+num;
    return num;
}
/*
 * Config
 */
var scale = 512;
var xmin = parseInt("3b", 16);
var xmax = parseInt("51", 16);
var ymin = parseInt("30", 16);
var ymax = parseInt("4d", 16);
console.log((xmax - xmin) + "x" +  (ymax - ymin));
console.log((xmax - xmin)*scale + "x" +  (ymax - ymin)*scale);
/*
 * Setup canvas
 */
var canvas = new Canvas((xmax - xmin)*scale, (ymax - ymin)*scale);
var ctx = canvas.getContext("2d");
/*
 * Actual computation
 */
var x = xmin, y = ymin;
ctx.strokeStyle = "white";
function recurse() {
    FS.readFile("east/" + lez(y.toString(16)) + lez(x.toString(16)) + ".png", function(err, content) {
        //console.log(lez(y.toString(16)) + ", " + lez(x.toString(16)));
        /*var flag = (x < parseInt("36", 16) && y < parseInt("39", 16)) ||
            (x > parseInt("43", 16) && y > parseInt("42", 16)) ;*/
            var flag = false;
        if(!err && !flag) {
            var img = new Image();
            img.src = content;
            ctx.drawImage(img, (x-xmin)*scale, (y-ymin)*scale, scale, scale);
        }
        else {
            ctx.fillStyle = "#2f76bb";
            ctx.fillRect((x-xmin)*scale, (y-ymin)*scale, scale, scale);
        }
        /*ctx.fillStyle ="white";
        ctx.strokeRect((x-xmin)*scale, (y-ymin)*scale, scale, scale);
        ctx.fillText(lez(y.toString(16)) + ", " + lez(x.toString(16)), (x-xmin)*scale + 20, (y-ymin)*scale + 20);*/

        x++;
        if(x >= xmax) {
            x = 0;
            y++
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
    var out = FS.createWriteStream("east.png");
    canvas.pngStream().on("data", function(chunk) {
        out.write(chunk);
    }).on("end", function() {
        console.log("Done.");
    })
}

recurse();
