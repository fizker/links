module.exports = {
	open: connect
};

var mongo = require('mongodb')
  , settings = require('../../src/settings').load('storage')
  , db

function connect(done) {
	var server = new mongo.Server(settings.host, settings.port, { auto_reconnect: true })
	  , db = new mongo.Db(settings.db, server)

	done(null, {
		disconnect: disconnect
		, users: users(db)
	});

	function disconnect() {
		db.close();
	};
};

function users(db) {
	return {
		get: userGet
		, add: userAdd
		, del: userRemove
	};

	function userGet(username, callback) {
		db.collection('users', function(err, collection) {
			collection.findOne({ username: username }, callback);
		});
	};

	function userAdd(user, callback) {
		db.collection('users', function(err, collection) {
			collection.save(user, callback);
		});
	};

	function userRemove(username, callback) {
		db.collection('users', function(err, collection) {
			collection.remove({ username: username }, callback);
		});
	};
}