'use strict';

module.exports = {
	create: setup
};

var db

function setup(options, database) {
	db = database;

	return {
		add: setLink,
		del: delLink,
		get: getLink,
		update: updateLink
	};

	function setLink(link, callback) {
		link = bindQuery(link);
		db.collection('links', function(err, collection) {
			collection.save(link, callback);
		});
	};
	function delLink(url, callback) {
		var query = bindQuery({
			url: url
		});
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
				var query = bindQuery({ url: url })
				collection.findOne(query, callback);
				return;
			}

			collection.find(bindQuery({})).toArray(callback);
		});
	};
	function updateLink(url, link, callback) {
		db.collection('links', function(err, collection) {
			var query = bindQuery({ url: url })
			  , update = { $set: link }
			collection.findAndModify(query, [], update, { new: true }, callback);
		});
	};

	function bindQuery(query) {
		query._user = options.user;
		return query;
	};
};
