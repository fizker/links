'use strict';

module.exports = {
	open: open
};

var mongo = require('mongodb')
  , links = require('./links')
  , users = require('./users')
  , server
  , db
  , storage

// Default values in case they are not set in options
  , settings = require('./../settings').load('storage')

function open(options, callback) {
	storage = {
		close: close,
		host: options.host || settings.host,
		port: options.port || settings.port,
		db: options.db || settings.db
		, bind: bind
	};

	server = new mongo.Server(storage.host, storage.port, { auto_reconnect: true });
	db = new mongo.Db(storage.db, server)

	storage.users = users.create(db);

	db.open(function(err) {
		if(err) { return callback(err, {
			host: options.host || host,
			port: options.port || port,
			dbName: options.dbName || dbName
		}); }

		callback(null, storage);
	});
};

function clone(obj) {
	return Object.keys(obj)
		.reduce(function(o, key) {
			o[key] = obj[key];
			return o;
		}, {});
};

function bind(user) {
	var storage = clone(this);
	storage.links = links.create({ user: user._id }, db);
	return storage;
};

function close(callback) {
	db.close();
	callback();
};
