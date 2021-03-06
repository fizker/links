'use strict';

module.exports = {
	create: setup
};

var db
  , tokenGen = require('../token')

function setup(database) {
	db = database;

	return {
		get: getUser,
		del: delUser,
		add: addUser,
		update: updateUser,
		byToken: byToken,
		verify: verifyUser
	};
}

function byToken(token, callback) {
	db.collection('users', function(err, collection) {
		var query = { 'tokens.key': token }
		collection.findOne(query, function(err, data) {
			callback(null, data || null);
		});
	});
};

function verifyUser(username, password, callback) {
	var token = tokenGen.generate(username, password);
	db.collection('users', function(err, collection) {
		var query = { username: username, password: password }
		collection.findAndModify(
			query
			, []
			, { $push: { tokens: token } }
			, { new: true }
			, function(err, data)
		{
			callback(null, data || null);
		})
	});
};

function addUser(user, callback) {
	user.tokens = [ tokenGen.generate(user.username, user.password) ];
	db.collection('users', function(err, collection) {
		collection.save(user, callback);
	});
};
function delUser(username, callback) {
	var query = {
		username: username
	};
	db.collection('users', function(err, collection) {
		collection.findAndModify(query, [], {}, { remove: true }, function(err, user) {
			db.collection('links', function(err, collection) {
				collection.remove({ _user: user._id.toString() }, function(err) {
					callback(err, user);
				});
			});
		});
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
};

function updateUser(username, user, callback) {
	db.collection('users', function(err, collection) {
		var query = { username: username }
		collection.findAndModify(query,
			[],
			{ $set: user },
			{ new: true },
			callback);
	});
};
