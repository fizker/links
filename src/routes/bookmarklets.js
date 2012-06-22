'use strict';

module.exports = setupRoutes;

var fs = require('fs')
  , path = require('path')

function setupRoutes(options) {
	var http = options.http
	  , bookmarklets = []

	loadBookmarklet(
		 'addlink'
		,'Add link'
		,'A bookmarklet for adding the current page to the list of links')

	http.get('/bookmarklets', function(request, response) {
		response.render('bookmarklets.list.mustache'
			, bookmarklets.map(function(bm) {
				bm.bookmarklet = bm.bookmarklet.replace('{{token}}', request.user.bookmarkletToken);
				return bm;
			})
		);
	});

	function loadBookmarklet(name, title, text) {
		var bookmarkFile = path.join(__dirname, '../../static/bookmarklets', name + '.bookmarklet.min.js')

		fs.readFile(bookmarkFile, 'utf8', fileRead);

		function fileRead(err, data) {
			bookmarklets.push(
				{ bookmarklet: data
				, encoded: encodeURIComponent(data)
				, title: title
				, text: text
				});
		};
	};
};
