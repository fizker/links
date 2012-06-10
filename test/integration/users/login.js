describe('integration/users/login.js', function() {
	var request = require('request')
	  , url = require('url')
	  , mongoHelper = require('../../helpers/mongo')
	  , users
	  , callbackSpy
	  , options

	before(function(done) {
		mongoHelper.open(function(err, storage) {
			users = storage.users;
			done();
		});
	});

	beforeEach(function(done) {
		options = {
			headers: {
				accept: 'text/html'
			}
			, url: url.parse('http://localhost:8080/login')
			, jar: request.jar()
			, form: { username: 'abc', password: 'def' }
		}
		users.add({ username: 'abc', password: 'def' }, done);
	});
	afterEach(function(done) {
		users.del('abc', done);
	});

	describe('When posting to login', function() {
		describe('with valid credentials', function() {
			beforeEach(function(done) {
				callbackSpy = sinon.spy(done);
				request.post(options, callbackSpy);
			});
			it('should return code 302 (redirect)', function() {
				expect(callbackSpy.getCall(0).args[1].statusCode)
					.to.equal(302);
			});
			it('should set a cookie to allow subsequent login', function(done) {
				options.url.path = '/profile';
				options.headers.accept = 'application/json';
				options.method = 'get';
				request.get(options, function(err, response, data) {
					expect(response.statusCode).to.equal(200);
					done();
				});
			});
		});
	});
});
