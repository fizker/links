'use strict';

module.exports = auth
auth.postLogin = postLogin;

function auth(request, response, next) {
	var userHasAuthed = getUserAuthed(request, response, next);
	if(handleHttpAuth(request, userHasAuthed)) {
		return;
	}
	if(handleHttpToken(request, userHasAuthed)) {
		return;
	}
	if(handleHttpCookie(request, userHasAuthed)) {
		return;
	};

	userHasAuthed(null, false);
};

function getUserAuthed(request, response, next) {
	return function userHasAuthed(err, user) {
		if(user) {
			// TODO: set a cookie
			response.cookie('x-user-token', user.token, {
				maxAge: 3600000 // 1 hour
			});
			request.cookies['x-user-token'] = user.token;
			return next();
		}

		if(request.accepts('html')) {
			response.render('user.login.mustache');
			return;
		}
		response.header('WWW-Authenticate', 'Basic realm="Fizker Inc Links"');
		response.send(401);
	};
};

function postLogin(request, response, next) {
	var user = request.body
	  , userHasAuthed = getUserAuthed(request, response, next);
	verifyUser(user.username, user.password, request, userHasAuthed);
};

function handleHttpCookie(request, next) {
	var token = request.cookies['x-user-token'];
	if(token) {
		request.headers['x-user-token'] = token;
		return handleHttpToken(request, next);
	}
	return false;
};

function handleHttpToken(request, next) {
	var token = request.header('x-user-token')
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
