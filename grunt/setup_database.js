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
					conn.query("CREATE TABLE IF NOT EXISTS cookies("+
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
					conn.query("CREATE TABLE IF NOT EXISTS categories ("+
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
							var categories = [
								["Exile Questhub", "Place where many quests and usually vendors and transmats and all kinds of settler-improvements can be found.", "questhub_exile.png"],
								["Quest", "NPCs that give you quests or tasks.", "quest.png"],
								["Taxi", "Fast-travel everywhere using taxis.", "taxi.png"],
								["Vendor", "All kinds of vendors that buy and sell stuff.", "vendor.png"],
								["Auction House", "An auction house.", "auction_house.png"],
								["Bank", "A bank.", "bank.png"],
								["Dye", "A dye vendor.", "dye.png"],
								["General POI", "A general point of interest.", "poi.png"],
								["Housing", "A transit to the next housing-teleporter.", "house.png"],
								["Mailbox", "A mailbox.", "mailbox.png"],
								["Node: Fishing", "A node for the tradeskill fishing.", "node_fishing.png"],
								["Node: Mining", "A node for the tradeskill miner.", "node_mining.png"],
								["Node: Farming", "A node for the tradeskill farmer.", "node_farming.png"],
								["Node: Relic", "A node for the tradeskill relic hunter.", "node_relic.png"],
								["Node: Tree", "A node for the tradeskill survivor.", "node_tree.png"],
								["Trainer", "Some craftingtrainer.", "trainer.png"],
								["Crafting", "A craftingtable.", "tradeskill.png"],
								["Dungeon", "Entry to a dungeon.", "dungeon.png"],
								["Eldan Stone", "An eldan stone can be found here.", "eldan_stone.png"],
								["Path: Scientist", "A mission belonging to the path of the scientist.", "mission_scientist.png"],
								["Path: Settler", "A mission belonging to the path of the settler.", "mission_settler.png"],
								["Path: Soldier", "A mission belonging to the path of the soldier.", "mission_soldier.png"],
								["Path: Explorer", "A mission belonging to the path of the explorer.", "mission_explorer.png"],
								["Commodities", "A commodities broker.", "commodities.png"],
								["Directions", "City directions advising NPCs.", "city_directions.png"]
							];
							var ok = 0;
							for(var i in categories) {
								(function(cat) {
									conn.query("SELECT id FROM categories WHERE name = ?", [cat[0]], function(err, rows) {
										if(rows.length == 0) {
											conn.query("INSERT INTO categories(name, description, icon) VALUES(?, ?, ?)", cat);
										}
									});
								})(categories[i]);
							}
						}
						createPlaces();
					});

				}
				function createPlaces() {
					conn.query("CREATE TABLE IF NOT EXISTS places("+
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
					conn.query("CREATE TABLE IF NOT EXISTS votes("+
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
