var assemble = require("./assemble.js");
var disassemble = require("./disassemble.js");
var FS = require("fs");
var MySQL = require("mysql");

function addToDescriptor(folder, name, done) {
	FS.readFile("htdocs/index.json", function(err, data) {
		var obj;
		if(err) obj = [];
		else obj = JSON.parse(data);
		var arr = [];
		for(var i in obj) {
			if(obj[i].folder != folder) arr.push(obj[i]);
		}
		arr.push({
			folder : folder,
			name : name
		});
		FS.writeFile("htdocs/index.json", JSON.stringify(arr), function() {
			done();
		});
	});
}

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
				addToDescriptor("map_west", "Western Continent", function() {
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
				addToDescriptor("map_east", "Eastern Continent", function() {
					done();
				});
			},
			file : "big/east.png",
			folder : "htdocs/map_east"
		});
	});
	grunt.registerTask('setup-database', function() {
		function stringToPass(string) {
			var pass = "";
			for(var i = 0; i < string.length; i++) pass += "*";
			return pass;
		}
		var done = this.async();
		FS.readFile("database_config.json", function(err, data) {
			var dbConf;
			if(err) {
				console.error("Unable to read databas_config.json. Creating sample.");
				dbConf = {
					host : "localhost",
					user : "root",
					password : "",
					database : "wildstar_map"
				};
				FS.writeFileSync("database_config.json", JSON.stringify(dbConf));
			}
			else {
				dbConf = JSON.parse(data);
			}
			console.log("Connecting to database...");
			console.log("\tHost: " + dbConf.host);
			console.log("\tUser: " + dbConf.user);
			console.log("\tPassword: " + stringToPass(dbConf));
			var conn = MySQL.createConnection(dbConf);
			conn.connect(function(err) {
				if(err) {
					grunt.fail.fatal("Unable to connect to database. Aborting.");
					done();
				}
				else {
					console.log("Successfully connected to database!");
					conn.query("CREATE TABLE categories ("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"name		  VARCHAR(128) NOT NULL," +
						"description  TEXT," +
						"icon		  VARCHAR(64)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"categories\"");
						}
						else console.log("Table \"categories\" successfully created!");
					});
					conn.query("CREATE TABLE ips("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"ip		  	  VARCHAR(42)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"ips\"");
						}
						else console.log("Table \"ips\" successfully created!");
					});
					conn.query("CREATE TABLE cookies("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"cookie	  	  VARCHAR(42)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"cookies\"");
						}
						else console.log("Table \"cookies\" successfully created!");
					});
					conn.query("CREATE TABLE places("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"name		  VARCHAR(128) NOT NULL," +
						"description  TEXT," +
						"category	  INT NOT NULL," +
						"x			  FLOAT NOT NULL," +
						"y			  FLOAT NOT NULL," +
						"parent		  INT," +
						"ip			  INT NOT NULL," +
						"cookie		  INT NOT NULL," +

						"FOREIGN KEY(category) REFERENCES categories(id)," +
						"FOREüIGN KEY(ip) REFERENCES ips(id)," +
						"FOREIGN KEY(cookie) REFERENCES cookies(id)," +
						"FOREIGN KEY(parent) REFERENCES places(id)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"places\"");
						}
						else console.log("Table \"places\" successfully created!");
					});
					conn.query("CREATE TABLE votes("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"value		  INT NOT NULL," +
						"place		  INT NOT NULL," +
						"ip			  INT NOT NULL," +
						"cookie		  INT NOT NULL," +

						"FOREIGN KEY(ip) REFERENCES ips(id)," +
						"FOREIGN KEY(cookie) REFERENCES cookies(id)," +
						"FOREIGN KEY(place) REFERENCES places(id)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"votes\"");
						}
						else console.log("Table \"votes\" successfully created!");
					});
				}
			});
		});
	});
	grunt.registerTask('west', ['assemble-west', 'disassemble-west']);
	grunt.registerTask('east', ['assemble-east', 'disassemble-east']);
	grunt.registerTask('maps', ['west', 'east']);
};
