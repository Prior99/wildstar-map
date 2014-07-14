var assemble = require("./assemble.js");
var disassemble = require("./disassemble.js");

module.exports = function(grunt) {
    grunt.registerTask('assemble-west', function() {
        var done = this.async();
        assemble({
            folder : "original/west",
            span : {
                x : {
                    min : parseInt("2e", 16),
                    max : parseInt("4a", 16)
                },
                y : {
                    min : parseInt("31", 16),
                    max : parseInt("48", 16)
                }
            },
            scale : 512,
            output : "big/west.png",
            finish : function() {
                done();
            }
        });
    });
    grunt.registerTask('disassemble-west', function() {
        var done = this.async();
        disassemble({
            scale : 128,
            maxStep : 8,
            startStep : 1,
            finish : function() {
                done();
            },
            file : "big/west.png",
            folder : "map_west"
        });
    });
    grunt.registerTask('disassemble-east', function() {
        var done = this.async();
        disassemble({
            scale : 128,
            maxStep : 8,
            startStep : 1,
            finish : function() {
                done();
            },
            file : "big/east.png",
            folder : "map_east"
        });
    });
    grunt.registerTask('assemble-east', function() {
        var done = this.async();
        assemble({
            folder : "original/east",
            span : {
                x : {
                    min : parseInt("3b", 16),
                    max : parseInt("51", 16)
                },
                y : {
                    min : parseInt("30", 16),
                    max : parseInt("4d", 16)
                }
            },
            scale : 512,
            output : "big/east.png",
            finish : function() {
                done();
            }
        });
    });
};
