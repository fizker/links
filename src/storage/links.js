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
		collection.remove(query, callback);
	});
};
function getLink(url, callback) {
	if(!callback) {
		callback = url;
		url = null;

	}
	db.collection('links', function(err, collection) {
		if(err) return callback(err);

		if(url) {
			var query = { url: url }
			collection.findOne(query, callback);
			return;
		}

		collection.find().toArray(callback);
	});
}
