'use strict';

module.exports = auth

function auth(request, response, next) {
	if(handleHttpAuth(request, userHasAuthed)) {
		return;
	}
	// check other means of authing here (token, cookie, whatever).

	userHasAuthed(null, false);

	function userHasAuthed(err, result) {
		if(result) {
			return next();
		}
		response.render('errors/401', { status: 401 });
	};
}

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

	request.storage.users.verify(username, password, function(err, user) {
		if(err) {
			return next(err);
		}

		request.user = user;
		next(null, user);
	});
	return true;
};
