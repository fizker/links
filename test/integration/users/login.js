describe('integration/users/login.js', function() {
	var request = require('request')
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
			, uri: 'http://localhost:8080/login'
			, jar: request.jar()
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
			it('should return code 200', function() {
				expect(callbackSpy)
					.to.have.been.calledWithMatch(null, { statusCode: 200 });
			});
			it('should set a cookie to allow subsequent login', function(done) {
				options.uri = 'http://localhost:8080/profile';
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
