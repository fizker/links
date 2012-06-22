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
		if(!user) {
			return next({ status: 401 });
		}

		if(request.header('x-user-token')) {
			user.token = request.header('x-user-token');
		} else if(user.tokens) {
			user.token = getLatestToken(user);
		}
		delete user.tokens;

		request.storage = request.storage.bind(user);
		request.user = user;
		next();
	};
};

function postLogin(request, response, next) {
	var user = request.body
	  , userHasAuthed = getUserAuthed(request, response, next);
	verifyUser(user.username, user.password, request, function(err, user) {
		if(err || !user) {
			return userHasAuthed(err);
		}
		var token = getLatestToken(user)
		response.cookie('x-user-token', token, {
			maxAge: 3600000 // 1 hour
		});
		request.cookies['x-user-token'] = token;

		userHasAuthed(null, user);
	});
};

function getLatestToken(user) {
	return user.token = user.tokens.reduce(function(newest, current) {
		return newest.created < current.created
			? current
			: newest
	}).key;
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
		request.storage.users.byToken(token, next);
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

		next(null, user);
	});
	return true;
};
