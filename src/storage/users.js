'use strict';

module.exports = setup;

var db
  , tokenGen = require('../token')

function setup(database) {
	db = database;

	return {
		get: getUser,
		del: delUser,
		add: addUser,
		byToken: byToken,
		verify: verifyUser
	};
}

function byToken(token, callback) {
	db.collection('users', function(err, collection) {
		var query = { token: token }
		collection.findOne(query, function(err, data) {
			callback(null, data || null);
		});
	});
};

function verifyUser(username, password, callback) {
	var token = tokenGen.generate([username, password]);
	db.collection('users', function(err, collection) {
		var query = { username: username, password: password }
		collection.findAndModify(query, [], { token: token }, function(err, data) {
			if(data) {
				data.token = token;
			}
			callback(null, data || null);
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
