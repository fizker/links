
module.exports = setup;

var middleware = require('../server/middleware')

function setup(options) {
	var http = options.http

	http.get('/signup', getSignup);
	http.get('/profile', middleware.auth, getProfile);
};

function getProfile(request, response) {
	response.render('profile', request.user);
};
function getSignup(request, response) {
	response.render('signup');
};
