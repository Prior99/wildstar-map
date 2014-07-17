var assemble = require("./grunt/assemble.js");
var disassemble = require("./grunt/disassemble.js");
var setupDatabase = require("./grunt/setup_database.js");
var Descriptor = require("./grunt/descriptor.js");
var FS = require("fs");


module.exports = function(grunt) {
	grunt.registerTask('assemble-west', function() {
		var done = this.async();
		try { FS.mkdirSync("big") } catch(err) {}
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
		try { FS.mkdirSync("htdocs/map_west") } catch(err) {}
		disassemble({
			scale : 128,
			maxStep : 8,
			startStep : 1,
			finish : function() {
				Descriptor.addToIndex("map_west", "Western Continent", function() {
					done();
				});
			},
			file : "big/west.png",
			folder : "htdocs/map_west"
		});
	});
	grunt.registerTask('assemble-east', function() {
		var done = this.async();
		try { FS.mkdirSync("big") } catch(err) {}
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
	grunt.registerTask('disassemble-east', function() {
		var done = this.async();
		try { FS.mkdirSync("htdocs/map_east") } catch(err) {}
		disassemble({
			scale : 128,
			maxStep : 8,
			startStep : 1,
			finish : function() {
				Descriptor.addToIndex("map_east", "Eastern Continent", function() {
					done();
				});
			},
			file : "big/east.png",
			folder : "htdocs/map_east"
		});
	});
	grunt.registerTask('setup-database', function() {
		setupDatabase(this.async());
	});
	grunt.registerTask('serverconfig', function() {
		var done = this.async();
		var obj = {
			port : 45673,
			host : "0.0.0.0",
			htdocsDirectory : "./htdocs/"
		};
		FS.writeFile("server_config.json", JSON.stringify(obj, null, 4), function(err) {
			if(err) {
				grunt.fail.fatal("Unable to write configfile \"server_config.json\".");
			}
			console.log("Example configfile \"server_config.json\" successfully created.");
			done();
		});
	});
	grunt.registerTask('west', ['assemble-west', 'disassemble-west']);
	grunt.registerTask('east', ['assemble-east', 'disassemble-east']);
	grunt.registerTask('maps', ['west', 'east']);

	grunt.initConfig({
		copy: {
			build: {
				cwd: 'client',
				src: ['**', '!js/**', '!style/**'],
				dest: 'htdocs',
				expand: true
			},
		},
		clean: {
			build: {
				src: ['htdocs/icons', 'htdocs/lib', 'htdocs/index.html', 'htdocs/site.js', 'htdocs/style.css']
			},
		},
		autoprefixer: {
			build: {
				expand: true,
				cwd: 'htdocs',
				src: ['**/*.css'],
				dest: 'htdocs'
			}
		},
		uglify: {
			build: {
				options: {
					sourceMap : true,
					sourceMapIncludeSources : true,
					mangle: false
				},
				files: {
					'htdocs/site.js': [ 'client/**/*.js' ]
				}
			}
		},
		less: {
			development: {
				options: {
					compress: true,
					yuicompress: true,
					optimization: 2
				},
				files: {
					"htdocs/style.css": "client/style/**.less"
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('style', ['less', 'autoprefixer']);
	grunt.registerTask('javascript', ['uglify']);
	grunt.registerTask('client', ['clean', 'copy', 'style', 'javascript']);
};
