'use strict';

module.exports = {
	open: open
};

var mongo = require('mongodb')
  , server
  , db
  , storage

// Default values in case they are not set in options
  , host = 'localhost'
  , port = 27017
  , dbName = 'finc-links-db'

function open(options, callback) {
	storage = {
		close: close,
		links: links,
		host: options.host || host,
		port: options.port || port,
		dbName: options.dbName || dbName
	};

	server = new mongo.Server(storage.host, storage.port, { auto_reconnect: true });
	db = new mongo.Db(storage.dbName, server)

	db.open(function(err) {
		if(err) { return callback(err); }

		callback(null, storage);
	});
};

function close(callback) {};

var links = {
	set: setLink,
	rm: rmLink,
	all: allLinks
};

function setLink() {};
function rmLink() {};
function allLinks() {};
