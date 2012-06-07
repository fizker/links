'use strict';

module.exports = errors;

var handlers =
	{ 401: handle401
	, 403: handleStatus
	, 404: handleStatus
	, 406: handleStatus
	};

function errors(err, request, response, next) {
	var handler = handlers[err.status] || defaultHandler
	handler(err, request, response, next);
};

function handle401(err, request, response, next) {
	if(request.accepts('html')) {
		response.render('user.login.mustache');
		return;
	}
	response.header('WWW-Authenticate', 'Basic realm="Fizker Inc Links"');
	response.send(401);
};
function handleStatus(err, request, response, next) {
	response.render('errors/'+err.status);
};

function defaultHandler(err, request, response, next) {
	response.render('errors/500');
};
