
module.exports = setup;

var middleware = require('../server/middleware')

function setup(options) {
	var http = options.http

	http.get('/login', getLogin);
	http.post('/login', middleware.auth.postLogin, handleLogin);

	http.get('/signup', getSignup);
	http.post('/signup', postSignup);

	http.get('/profile', middleware.auth, getProfile);
	http.put('/profile', middleware.auth, putProfile);
};

function getProfile(request, response) {
	response.render('user.profile.mustache', request.user);
};
function putProfile(request, response) {
	var user = request.user
	request.storage.users.update(user.username, request.body, function(err, user) {
		response.render('user.profile.mustache', user);
	});
};

function getSignup(request, response) {
	response.render('user.signup.mustache');
};
function postSignup(request, response) {
	request.storage.users.add(request.body, function(err, user) {
		response.cookie('x-user-token', user.token);
		response.render('user.welcome.mustache', user);
	});
};

function handleLogin(request, response) {
	response.redirect('/');
};
function getLogin(request, response) {
	response.render('user.login.mustache');
}
