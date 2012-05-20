'use strict';

module.exports = errors;

var handlers =
	{ 401: handle401
	, 404: handle404
	};

function errors(err, request, response, next) {
	var handler = handlers[err.status] || defaultHandler
	handler(err, request, response, next);
};

function handle401(err, request, response, next) {
	response.render('user.login.mustache');
};
function handle404(err, request, response, next) {
	response.render('errors/404');
};

function defaultHandler(err, request, response, next) {
	response.render('errors/500');
};
