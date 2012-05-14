
module.exports = setup;

var middleware = require('../server/middleware')

function setup(options) {
	var http = options.http

	http.get('/login', getLogin);
	http.get('/signup', getSignup);
	http.get('/profile', middleware.auth, getProfile);
};

function getProfile(request, response) {
	response.render('user.profile.mustache', request.user);
};
function getSignup(request, response) {
	response.render('user.signup.mustache');
};
function getLogin(request, response) {
	response.render('user.login.mustache');
}
