'use strict';

module.exports = errors;

var handlers = {
	401: handle401
};

function errors(err, request, response, next) {
	var handler = handlers[err.status] || defaultHandler
	handler(err, request, response, next);
};

function handle401(err, request, response, next) {
	response.render('user.login.mustache');
};

function defaultHandler(err, request, response, next) {
	response.render('errors/500');
};
