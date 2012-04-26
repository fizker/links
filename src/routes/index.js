'use strict';

module.exports = setupRoutes;

function setupRoutes(http) {
	http.get('/', function(request, response) {
		response.render('index');
	});
};