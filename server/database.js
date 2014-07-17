var Crypto = require('crypto');

function Database(pool) {
	this.pool = pool
};

Database.prototype = {
	getPlaces : function(map, callback) {
		this.pool.query(
			"SELECT " +
				"p.x AS x," +
				"p.y AS y," +
				"p.name AS name," +
				"p.description AS description," +
				"c.name AS category," +
				"c.icon AS icon, " +
				"p.id as id, " +
				"SUM(v.value) AS score " +
			"FROM places p " +
			"LEFT JOIN categories c ON p.category = c.id " +
			"LEFT JOIN votes v ON p.id = v.place " +
			"WHERE map = ? " +
			"GROUP BY p.id",
			[map],
			function(err, rows) {
				if(err) {
					console.error(err);
				}
				callback(err, rows);
			}
		);
	},
	vote : function(value, place, uid, callback) {
		this.pool.query("INSERT INTO votes (value, place, cookie) VALUES(?, ?, ?)",
			[value, place, uid], function(err, result) {
			if(err) {
				console.error(err);
				callback(err);
			}
			else {
				callback(undefined);
			}
		});

	},
	getVote : function(place, uid, callback) {
		this.pool.query("SELECT value FROM votes WHERE cookie = ? AND place = ?",
			[uid, place], function(err, rows) {
			if(err) {
				console.error(err);
				callback(err);
			}
			else {
				if(rows.length == 0) {
					callback(undefined, undefined);
				}
				else {
					callback(undefined, rows[0].value);
				}
			}
		});
	},
	unvote : function(place, uid, callback) {
		this.pool.query("DELETE FROM votes WHERE cookie = ? AND place = ?",
		[uid, place], function(err, result) {
			if(err) {
				console.error(err);
				callback(err);
			}
			else {
				callback(undefined);
			}
		});
	},
	getVoteScore : function(place, callback) {
		this.pool.query("SELECT SUM(value) AS score FROM votes WHERE place = ?",
		[place], function(err, rows) {
			if(err) {
				console.error(err);
				callback(err);
			}
			else {
				if(rows.length != 1) {
					callback("getVoteScore() selected more or less than one row.");
				}
				else {
					callback(undefined, rows[0].score);
				}
			}
		});
	},
	getCategory : function(id, callback) {
		this.pool.query("SELECT name, icon FROM categories WHERE id = ?", [id], function(err, rows) {
			if(err) {
				console.log(err);
				callback(err, undefined);
			}
			else {
				callback(undefined, rows[0]);
			}
		});
	},
	addPlace : function(x, y, name, description, category, cookie, map, callback) {
		var self = this;
		this.getCategory(category, function(err, catOK) {
			if(catOK) {
				self.pool.query("INSERT INTO places(map, name, description, x, y, category, cookie) VALUES (?, ?, ?, ?, ?, ?, ?)",
					[map, name, description, x, y, category, cookie],
					function(err2, result) {
						if(err2) {
							console.error(err2);
							callback(err);
						}
						else callback(undefined, result.insertId);
					}
				);
			}
			else {
				callback("This is not a valid category.");
			}
		});
	},
	getCategories : function(callback) {
		this.pool.query("SELECT id, name, description, icon FROM categories", function(err, rows) {
			if(err) {
				console.error(err);
				callback(err);
			}
			else {
				callback(undefined, rows);
			}
		});
	},
	addUser : function(ip, callback) {
		this.pool.getConnection(function(err, conn) {
			conn.query("SELECT id FROM cookies ORDER BY id DESC LIMIT 1, 1", function(err, rows) {
				if(err) {
					console.error(err);
					callback(err);
				}
				else {
					var id;
					if(rows.length == 0) id = 0;
					else id = rows[0].id + 1;
					var string = ip + Date.now() + id;
					var hash = Crypto.createHash("sha1").update(string).digest("hex");
					conn.query("INSERT INTO cookies(cookie) VALUES(?)", [hash], function(err, result) {
						conn.release();
						if(err) {
							console.error(err);
							callback(err);
						}
						else {
							callback(undefined, hash, result.insertId);
						}
					});
				}
			});
		});
	},
	getUserID : function(cookie, callback) {
		this.pool.getConnection(function(err, conn) {
			conn.query("SELECT id FROM cookies WHERE cookie = ?", [cookie], function(err, rows) {
				conn.release();
				if(!err && rows.length == 1) callback(undefined, rows[0].id);
				else {
					if(err) {
						console.error(err);
						callback(err);
					}
					else {
						if(rows.length > 1) console.error("There is more then one user with the same key. Fuck!");
						callback("This is not a valid userid.");
					}
				}
			});
		});
	}
};

module.exports = Database;
