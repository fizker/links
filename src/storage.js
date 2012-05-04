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

function close(callback) {
	db.close();
	callback();
};

var links = {
	add: setLink,
	del: delLink,
	get: getLink
};

function setLink(link, callback) {
	db.collection('links', function(err, collection) {
		collection.save(link, callback);
	});
};
function delLink(url, callback) {
	var query = {
		url: url
	};
	db.collection('links', function(err, list) {
		list.findAndModify(query, {}, null, { remove: true }, callback);
	});
};
function getLink(url, callback) {
	if(!callback) {
		callback = url;
		url = null;
	}

	db.collection('links', function(err, list) {
		if(err) return callback(err);
		list.find().toArray(callback);
	});
};
