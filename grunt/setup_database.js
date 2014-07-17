var FS = require("fs");
var MySQL = require("mysql");

module.exports = function(done) {
	function stringToPass(string) {
		var pass = "";
		for(var i = 0; i < string.length; i++) pass += "*";
		return pass;
	}
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
			FS.writeFileSync("database_config.json", JSON.stringify(dbConf, null, 4));
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
				function createCookies() {
					conn.query("CREATE TABLE cookies("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"cookie	  	  VARCHAR(42)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"cookies\"");
						}
						else console.log("Table \"cookies\" successfully created!");
						createCategories();
					});
				}
				function createCategories() {
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
						else {
							console.log("Table \"categories\" successfully created!");
							conn.query("INSERT INTO categories (name, description, icon) VALUES ?", [[
								["Exile Questhub", "Place where many quests and usually vendors and transmats and all kinds of settler-improvements can be found.", "questhub_exile.png"],
								["Quest", "NPCs that give you quests or tasks.", "quest.png"],
								["Taxi", "Fast-travel everywhere using taxis.", "taxi.png"],
								["Vendor", "All kinds of vendors that buy and sell stuff.", "vendor.png"]
							]], function(err, result) {
								if(err) {
									console.error(err);
									grunt.fail.fatal("Unable to insert default categories.");
								}
								else console.log(result.affectedRows + " categories created.");
							});
						}
						createPlaces();
					});

				}
				function createPlaces() {
					conn.query("CREATE TABLE places("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"name		  VARCHAR(128) NOT NULL," +
						"description  TEXT," +
						"category	  INT NOT NULL," +
						"x			  FLOAT NOT NULL," +
						"y			  FLOAT NOT NULL," +
						"parent		  INT," +
						"cookie		  INT NOT NULL," +
						"map		  VARCHAR(64) NOT NULL," +

						"FOREIGN KEY(category) REFERENCES categories(id)," +
						"FOREIGN KEY(cookie) REFERENCES cookies(id)," +
						"FOREIGN KEY(parent) REFERENCES places(id)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"places\"");
						}
						else console.log("Table \"places\" successfully created!");
							createVotes();
					});
				}
				function createVotes() {
					conn.query("CREATE TABLE votes("+
						"id			  INT NOT NULL AUTO_INCREMENT PRIMARY KEY," +
						"value		  INT NOT NULL," +
						"place		  INT NOT NULL," +
						"cookie		  INT NOT NULL," +

						"FOREIGN KEY(cookie) REFERENCES cookies(id)," +
						"FOREIGN KEY(place) REFERENCES places(id)" +
					")", function(err) {
						if(err) {
							console.error(err);
							grunt.fail.fatal("Unable to create table \"votes\"");
						}
						else console.log("Table \"votes\" successfully created!");
						conn.end();
						done();
					});
				}
				createCookies();
			}
		});
	});
};
