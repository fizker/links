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
	if(request.accept('html')) {
		response.render('user.login.mustache');
		return;
	}
	response.header('WWW-Authenticate', 'Basic realm="Fizker Inc Links"');
	response.send(401);
};
function handle404(err, request, response, next) {
	response.render('errors/404');
};

function defaultHandler(err, request, response, next) {
	response.render('errors/500');
};
