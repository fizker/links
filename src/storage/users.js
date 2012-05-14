'use strict';

module.exports = setup;

var db

function setup(database) {
	db = database;

	return {
		get: getUser,
		del: delUser,
		add: addUser,
		verify: verifyUser
	};
}

function verifyUser(username, password, callback) {
	db.collection('users', function(err, collection) {
		var query = { username: username, password: password }
		collection.findOne(query, function(err, data) {
			callback(null, !!data);
		})
	});
};

function addUser(username, callback) {
	db.collection('username', function(err, collection) {
		collection.save(username, callback);
	});
};
function delUser(username, callback) {
	var query = {
		username: username
	};
	db.collection('users', function(err, collection) {
		collection.remove(query, callback);
	});
};

function getUser(username, callback) {
	if(!callback) {
		callback = username;
		username = null;

	}
	db.collection('users', function(err, collection) {
		if(err) return callback(err);

		if(username) {
			var query = { username: username }
			collection.findOne(query, callback);
			return;
		}

		collection.find().toArray(callback);
	});
}
