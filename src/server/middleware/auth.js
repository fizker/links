'use strict';

module.exports = auth

function auth(request, response, next) {
	if(handleHttpAuth(request, userHasAuthed)) {
		return;
	}
	if(handleHttpToken(request, userHasAuthed)) {
		return;
	}
	// check other means of authing here (cookie, whatever).

	userHasAuthed(null, false);

	function userHasAuthed(err, result) {
		if(result) {
			return next();
		}

		if(request.accept('html')) {
			response.render('user.login.mustache');
			return;
		}
		response.header('WWW-Authenticate', 'Basic realm="Fizker Inc Links"');
		response.send(401);
	};
};

function handleHttpToken(request, next) {
	var token = request.header('X-User-Token')
	if(token) {
		request.storage.users.byToken(token, function(err, user) {
			request.user = user;
			next(null, user);
		});
		return true;
	}
};

function handleHttpAuth(request, next) {
	var authHeader = request.header('Authorization')
	  , base64
	  , debase64
	  , split
	  , username
	  , password

	if(!authHeader) {
		return false;
	}

	base64 = authHeader.replace('Basic ', '')
	debase64 = new Buffer(base64, 'base64').toString('ascii');
	split = debase64.split(/:/);
	username = split[0];
	password = split[1];

	return verifyUser(username, password, request, next);
};

function verifyUser(username, password, request, next) {
	request.storage.users.verify(username, password, function(err, user) {
		if(err) {
			return next(err);
		}

		request.user = user;
		next(null, user);
	});
	return true;
};
