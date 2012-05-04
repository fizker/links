'use strict';

module.exports = setup;

var db

function setup(database) {
	db = database;

	return {
		add: setLink,
		del: delLink,
		get: getLink
	};
}

function setLink(link, callback) {
	db.collection('links', function(err, collection) {
		collection.save(link, callback);
	});
};
function delLink(url, callback) {
	var query = {
		url: url
	};
	db.collection('links', function(err, collection) {
		collection.findAndModify(query, {}, null, { remove: true }, callback);
	});
};
function getLink(url, callback) {
	if(!callback) {
		callback = url;
		url = null;
	}

	db.collection('links', function(err, collection) {
		if(err) return callback(err);
		collection.find().toArray(callback);
	});
}
