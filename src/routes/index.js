'use strict';

module.exports = setupRoutes;

function setupRoutes(options) {
	var http = options.http

	http.get('/', function(request, response) {
		response.render('index');
	});

	require('./links')(options);
	require('./bookmarklets')(options);
	require('./users')(options);

	http.get('*', function(request, response, next) {
		next({ status: 404 });
	});
};
